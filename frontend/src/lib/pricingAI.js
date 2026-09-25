import { supabase } from './supabaseClient';

const API_BASE_URL = 'https://kalasetu-backend-tj3p.onrender.com';

export async function generatePriceSuggestion({
  name,
  craftType,
  description,
  currentPrice,
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
    `${API_BASE_URL}/api/ai/pricing/suggest`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },

      body: JSON.stringify({
        name: name.trim(),
        craftType:
          craftType?.trim() || '',
        description:
          description?.trim() || '',
        currentPrice:
          currentPrice || '',
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Failed to generate price suggestion.'
    );
  }

  if (!data.suggestion) {
    throw new Error(
      'AI did not return a price suggestion.'
    );
  }

  return data.suggestion;
}