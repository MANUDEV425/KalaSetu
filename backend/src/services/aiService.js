import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey =
  process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn(
    'GEMINI_API_KEY is not configured.'
  );
}

const genAI = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

export async function generateText(prompt) {
  if (!genAI) {
    throw new Error(
      'Gemini AI is not configured.'
    );
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
  });

  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result =
        await model.generateContent(prompt);

      const response = result.response;
      const text = response.text();

      if (!text?.trim()) {
        throw new Error(
          'AI returned an empty response.'
        );
      }

      return text.trim();
    } catch (error) {
      lastError = error;

      const message =
        error?.message || '';

      const isTemporaryError =
        message.includes('503') ||
        message.includes('Service Unavailable');
     

      if (!isTemporaryError) {
        throw error;
      }

      const delay =
        1000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
}