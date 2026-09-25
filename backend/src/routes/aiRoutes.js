import express from 'express';

import {
  generateProductDescription,
} from '../controllers/aiController.js';

import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/product-description',
  requireAuth,
  generateProductDescription
);

export default router;