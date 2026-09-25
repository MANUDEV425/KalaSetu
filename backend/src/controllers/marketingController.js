import { generateText } from '../services/aiService.js';

export async function generateMarketingKit(
  req,
  res
) {
  try {
    const {
      name,
      craftType,
      description,
      price,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Product name is required.',
      });
    }

 const prompt = `
You are a marketing assistant for Indian handmade artisans.

Create a compact marketing kit for this product.

Product:
${name.trim()}

Craft:
${craftType?.trim() || 'Not specified'}

Description:
${description?.trim() || 'Not provided'}

Price:
${price || 'Not provided'}

Return exactly:

Instagram Caption:
[2 short sentences]

Hashtags:
[6-8 relevant hashtags]

Target Buyer:
[1 short sentence]

Selling Hook:
[1 short sentence]

WhatsApp Message:
[2 short sentences]

Rules:
- Keep the entire response under 120 words.
- Keep every section concise.
- Highlight handmade craftsmanship.
- Do not invent materials, features, certifications,
  locations, awards, or other facts.
- Do not make unrealistic claims.
- No emojis.
`;

    const marketingKit =
      await generateText(prompt);

    return res.status(200).json({
      marketingKit,
    });
  } catch (error) {
    console.error(
      'AI marketing kit error:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Failed to generate marketing kit.',
    });
  }
}