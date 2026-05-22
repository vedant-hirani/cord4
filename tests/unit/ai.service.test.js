import { jest } from '@jest/globals';
import ApiError from '../../src/utils/ApiError.js';

const mockPost = jest.fn();

// Register the ES mock for axios
jest.unstable_mockModule('axios', () => ({
  __esModule: true,
  default: {
    post: mockPost,
  },
}));

// Import the service dynamically after registering the mock
const { default: aiService } = await import('../../src/models/ai/ai.service.js');

describe('AIService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if GROK_API_KEY is not configured', async () => {
    delete process.env.GROK_API_KEY;
    await expect(aiService.extractExpense('Raw text')).rejects.toThrow(
      'Grok/Groq API Key is missing. Please configure GROK_API_KEY in your .env file.'
    );
  });

  it('should route to Groq Cloud endpoint if key starts with gsk_', async () => {
    process.env.GROK_API_KEY = 'gsk_testkey12345';
    
    mockPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                amount: 32.45,
                category: 'Transport',
                date: '2026-05-22',
                note: 'Uber ride',
              }),
            },
          },
        ],
      },
    });

    const result = await aiService.extractExpense('Spent 32.45 on Uber ride on 2026-05-22');

    expect(mockPost).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        model: 'llama-3.3-70b-versatile',
        messages: expect.any(Array),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer gsk_testkey12345',
        }),
      })
    );

    expect(result).toEqual({
      amount: 32.45,
      category: 'Transport',
      date: '2026-05-22',
      note: 'Uber ride',
    });
  });

  it('should route to xAI Grok endpoint if key does not start with gsk_', async () => {
    process.env.GROK_API_KEY = 'xai_some_other_key';

    mockPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                amount: 15.0,
                category: 'Food',
                date: '2026-05-22',
                note: 'Pizza lunch',
              }),
            },
          },
        ],
      },
    });

    const result = await aiService.extractExpense('Lunch at Pizza shop for $15');

    expect(mockPost).toHaveBeenCalledWith(
      'https://api.x.ai/v1/chat/completions',
      expect.objectContaining({
        model: 'grok-2',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer xai_some_other_key',
        }),
      })
    );

    expect(result).toEqual({
      amount: 15.0,
      category: 'Food',
      date: '2026-05-22',
      note: 'Pizza lunch',
    });
  });

  it('should fallback to default values if AI returns slightly invalid JSON fields or formats', async () => {
    process.env.GROK_API_KEY = 'gsk_testkey12345';

    mockPost.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: '```json\n{\n  "amount": "not-a-number",\n  "category": "InvalidCategory",\n  "date": "invalid-date",\n  "note": 1234\n}\n```',
            },
          },
        ],
      },
    });

    const result = await aiService.extractExpense('bad format');

    expect(result.amount).toBe(0);
    expect(result.category).toBe('Other');
    expect(result.date).toBe(new Date().toISOString().split('T')[0]);
    expect(result.note).toBe('AI Extracted Expense');
  });

  it('should throw an ApiError if the Axios request fails with response details', async () => {
    process.env.GROK_API_KEY = 'gsk_testkey12345';

    const axiosError = new Error('Request failed');
    axiosError.response = {
      status: 400,
      data: {
        error: {
          message: 'Invalid API Key',
        },
      },
    };

    mockPost.mockRejectedValue(axiosError);

    await expect(aiService.extractExpense('rawText')).rejects.toThrow(
      'Groq API error: Invalid API Key'
    );
  });
});
