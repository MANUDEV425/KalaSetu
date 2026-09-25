import { generateText } from '../services/aiService.js';

export async function generatePriceSuggestion(
  req,
  res
) {
  try {
    const {
      name,
      craftType,
      description,
      currentPrice,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Product name is required.',
      });
    }

    const prompt = `
You are a pricing advisor for Indian
handmade artisan products.

Analyze the product information below and
suggest a reasonable selling price range in
Indian Rupees.

Product name:
${name.trim()}

Craft type:
${craftType?.trim() || 'Not specified'}

Description:
${description?.trim() || 'Not provided'}

Current artisan price:
${currentPrice || 'Not provided'}

Consider:
- Handmade craftsmanship
- Craft category
- Product complexity
- Likely material and labor considerations
- Indian handmade marketplace positioning

Important:
- Do not invent specific material costs.
- Do not claim to know actual market prices
  unless provided.
- Give a reasonable estimated range, not a
  guaranteed market value.
- Explain the main factors behind the estimate.
- Keep the advice practical for an artisan.

Return exactly in this format:

Suggested range: ₹X - ₹Y

Recommended starting price: ₹Z

Reasoning:
2-4 short sentences explaining the estimate.
`;

    const suggestion =
      await generateText(prompt);

    return res.status(200).json({
      suggestion,
    });
  } catch (error) {
    console.error(
      'AI pricing error:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Failed to generate price suggestion.',
    });
  }
}