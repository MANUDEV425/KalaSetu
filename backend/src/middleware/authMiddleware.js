import { supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Protects a route by requiring a valid Supabase access token.
 * The frontend sends the token as: Authorization: Bearer <access_token>
 *
 * On success, attaches the authenticated user to req.user and calls next().
 * On failure, responds with 401.
 *
 * This is the same pattern later AI routes (product analysis, pricing, etc.)
 * will reuse, so it's worth getting right now even though only one route
 * uses it in this phase.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  req.user = data.user;
  next();
}
