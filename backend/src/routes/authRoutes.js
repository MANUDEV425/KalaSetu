import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMe } from '../controllers/authController.js';

const router = Router();

// Signup/login themselves happen on the frontend via the Supabase JS client
// (see frontend/src/context/AuthContext.jsx). This backend route exists to
// prove the JWT-verification pattern works end-to-end, and to give the
// frontend a safe way to fetch the current user's profile.
router.get('/me', requireAuth, getMe);

export default router;
