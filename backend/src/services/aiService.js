import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn('GEMINI_API_KEY is not configured.');
}

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
    })
  : null;

export async function generateText(prompt) {
  if (!ai) {
    throw new Error('Gemini AI is not configured.');
  }

  try {
    const response =
      await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

    const text = response.text;

    if (!text?.trim()) {
      throw new Error(
        'AI returned an empty response.'
      );
    }

    return text.trim();
  } catch (error) {
    console.error('Gemini API error:', error);

    throw new Error(
      error?.message ||
        'Failed to generate AI response.'
    );
  }
}