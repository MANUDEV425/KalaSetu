import { supabaseAdmin } from '../config/supabaseClient.js';

/**
 * GET /api/auth/me
 * Returns the logged-in user's auth info plus their profile row
 * (role, full_name, shop_name, etc.) from the "profiles" table.
 */
export async function getMe(req, res) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found for this user.' });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      profile,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Something went wrong while fetching your profile.' });
  }
}
