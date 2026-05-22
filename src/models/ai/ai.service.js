import fs from 'fs';
import axios from 'axios';
import { createRequire } from 'module';
import ApiError from '../../utils/ApiError.js';
import env from '../../config/env.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

class AIService {
  async extractExpense(input) {
    let rawText = '';
    let file = null;

    if (typeof input === 'string') {
      rawText = input;
    } else if (input && typeof input === 'object') {
      rawText = input.rawText || '';
      file = input.file || null;
    }

    const originalFile = file;

    const grokApiKey = env.GROK_API_KEY;
    if (!grokApiKey) {
      // Cleanup file if API key is missing
      if (originalFile && originalFile.path) {
        try {
          fs.unlinkSync(originalFile.path);
        } catch (_) {}
      }
      throw new ApiError(500, 'Grok/Groq API Key is missing. Please configure GROK_API_KEY in your .env file.');
    }

    // Process PDF or CSV text extraction before LLM routing
    if (file) {
      const extension = file.originalname ? file.originalname.split('.').pop().toLowerCase() : '';
      const isCSV = extension === 'csv' || file.mimetype === 'text/csv';
      const isPDF = extension === 'pdf' || file.mimetype === 'application/pdf';

      if (isCSV) {
        try {
          const fileText = fs.readFileSync(file.path, 'utf8');
          rawText = (rawText ? rawText + '\n\n' : '') + '[Uploaded CSV File Content]:\n' + fileText;
          
          // Delete file immediately as we have extracted the text
          try {
            fs.unlinkSync(file.path);
          } catch (_) {}
          file = null; // Demote to high-speed text completion models
        } catch (readErr) {
          throw new ApiError(500, `Failed to read uploaded CSV receipt: ${readErr.message}`);
        }
      } else if (isPDF) {
        try {
          const fileBuffer = fs.readFileSync(file.path);
          const parser = new PDFParse();
          const pdfData = await parser.loadPDF(fileBuffer);
          // Collect text from all pages
          const allPages = pdfData.pages || [];
          const fileText = allPages.map(p => p.text || '').join('\n').trim();
          rawText = (rawText ? rawText + '\n\n' : '') + '[Uploaded PDF File Content]:\n' + (fileText || '');

          // Delete file immediately as we have extracted the text
          try {
            fs.unlinkSync(file.path);
          } catch (_) {}
          file = null; // Demote to high-speed text completion models
        } catch (readErr) {
          throw new ApiError(500, `Failed to parse uploaded PDF receipt: ${readErr.message}`);
        }
      }
    }

    // Dynamic endpoint auto-detection.
    // Keys starting with 'gsk_' are Groq Cloud keys, others are treated as xAI Grok keys.
    const isGroq = grokApiKey.startsWith('gsk_');
    const apiBrand = isGroq ? 'Groq' : 'Grok';
    
    let apiUrl = 'https://api.x.ai/v1/chat/completions';
    let modelName = 'grok-2';

    if (isGroq) {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      modelName = 'llama-3.3-70b-versatile';
    }

    // Use vision models if file is provided (only standard images JPEG/PNG/GIF/etc. make it here)
    if (file) {
      if (isGroq) {
        modelName = 'meta-llama/llama-4-scout-17b-16e-instruct';
      } else {
        modelName = 'grok-2-vision-1212';
      }
    }

    const systemPrompt = `You are a highly precise financial data extraction assistant.
Extract the expense details from the provided receipt/bill/SMS image or raw text.
Identify:
1. "amount": The total cost (Number).
2. "category": Pick EXACTLY one of: "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Other".
3. "date": The transaction date in "YYYY-MM-DD" format. If no date is found, use the current date in "YYYY-MM-DD" format.
4. "note": A short, clear descriptive summary of the item or store name (String).

You MUST return ONLY a raw valid JSON object. Do not include markdown code block formatting (such as \`\`\`json ... \`\`\`), explanations, or introductory text. The output should be directly parseable by JSON.parse.

Response template:
{
  "amount": 25.50,
  "category": "Food",
  "date": "2026-05-22",
  "note": "Subway lunch"
}`;

    let messages = [
      { role: 'system', content: systemPrompt }
    ];

    let imageBase64 = null;
    let mimeType = '';

    if (file) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        imageBase64 = fileBuffer.toString('base64');
        mimeType = file.mimetype;
      } catch (readErr) {
        throw new ApiError(500, `Failed to read uploaded receipt image: ${readErr.message}`);
      }
    }

    if (file && imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract financial details from this receipt image. Accompanying text (if any): ' + rawText
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Extract details from this raw text:\n\n${rawText}`
      });
    }

    try {
      const response = await axios.post(
        apiUrl,
        {
          model: modelName,
          messages,
          temperature: 0.1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${grokApiKey}`,
          },
        }
      );

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new ApiError(502, `${apiBrand} API returned an empty or invalid chat completion payload.`);
      }

      const content = response.data.choices[0].message?.content?.trim();
      if (!content) {
        throw new ApiError(502, `${apiBrand} API returned an empty message content.`);
      }
      
      // Clean up markdown block quotes if the model wrapped it anyway
      let cleanContent = content;
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      try {
        const result = JSON.parse(cleanContent);
        
        // Ensure values are structured correctly
        return {
          amount: typeof result.amount === 'number' && result.amount >= 0 ? result.amount : 0,
          category: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other'].includes(result.category) 
            ? result.category 
            : 'Other',
          date: result.date && /^\d{4}-\d{2}-\d{2}$/.test(result.date) 
            ? result.date 
            : new Date().toISOString().split('T')[0],
          note: typeof result.note === 'string' ? result.note.trim() : 'AI Extracted Expense',
        };
      } catch (parseError) {
        throw new ApiError(422, `${apiBrand} returned an invalid JSON response structure. Please review raw input.`);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message || 'AI Autofill extraction failed';
      throw new ApiError(status, `${apiBrand} API error: ${message}`);
    } finally {
      // Always cleanup uploaded file
      if (originalFile && originalFile.path) {
        try {
          if (fs.existsSync(originalFile.path)) {
            fs.unlinkSync(originalFile.path);
          }
        } catch (unlinkErr) {
          console.warn('Failed to delete temp uploaded file:', originalFile.path, unlinkErr.message);
        }
      }
    }
  }
}

export default new AIService();
export { AIService };
