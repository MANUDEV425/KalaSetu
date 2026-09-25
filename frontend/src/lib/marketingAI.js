import { supabase } from './supabaseClient';

const API_BASE_URL = 'https://kalasetu-backend-tj3p.onrender.com';

export async function generateMarketingKit({
  name,
  craftType,
  description,
  price,
}) {
  if (!name?.trim()) {
    throw new Error(
      'Product name is required.'
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      'Please log in to use AI features.'
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/ai/marketing/generate`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization:
          `Bearer ${session.access_token}`,
      },

      body: JSON.stringify({
        name: name.trim(),

        craftType:
          craftType?.trim() || '',

        description:
          description?.trim() || '',

        price: price || '',
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Failed to generate marketing kit.'
    );
  }

  if (!data.marketingKit) {
    throw new Error(
      'AI did not return a marketing kit.'
    );
  }

  return data.marketingKit;
}