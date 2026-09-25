import { generateText } from '../services/aiService.js';

export async function generateProductDescription(
  req,
  res
) {
  try {
    const {
      name,
      craftType,
      description,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Product name is required.',
      });
    }

const prompt = `
You are a marketplace copywriter for Indian
handmade artisans.

Create a short product description.

Product:
${name.trim()}

Craft:
${craftType?.trim() || 'Not specified'}

Existing description:
${description?.trim() || 'Not provided'}

Requirements:
- Exactly 2 to 3 short sentences.
- Maximum 50 words.
- Highlight handmade craftsmanship.
- Mention the craft when relevant.
- Do not invent facts or features.
- Do not make unrealistic claims.
- No emojis.
- Return only the description.
`;

    const generatedDescription =
      await generateText(prompt);

    return res.status(200).json({
      description: generatedDescription,
    });
  } catch (error) {
    console.error(
      'AI product description error:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Failed to generate product description.',
    });
  }
}