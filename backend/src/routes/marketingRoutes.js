import express from 'express';

import {
  generateMarketingKit,
} from '../controllers/marketingController.js';

import {
  requireAuth,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/generate',
  requireAuth,
  generateMarketingKit
);

export default router;