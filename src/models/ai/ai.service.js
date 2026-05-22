import axios from 'axios';
import ApiError from '../../utils/ApiError.js';

class AIService {
  async extractExpense(rawText) {
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      throw new ApiError(500, 'Grok/Groq API Key is missing. Please configure GROK_API_KEY in your .env file.');
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

    const systemPrompt = `You are a highly precise financial data extraction assistant.
Extract the expense details from the provided raw text block (which can be a receipt, bill, invoice, or SMS).
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

    try {
      const response = await axios.post(
        apiUrl,
        {
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract details from this raw text:\n\n${rawText}` },
          ],
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
    }
  }
}

export default new AIService();
export { AIService };
