import express from 'express';

import {
  generatePriceSuggestion,
} from '../controllers/pricingController.js';

import {
  requireAuth,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/suggest',
  requireAuth,
  generatePriceSuggestion
);

export default router;