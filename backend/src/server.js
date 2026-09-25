import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';

import {
  generateProductDescription,
} from './controllers/aiController.js';

import {
  generatePriceSuggestion,
} from './controllers/pricingController.js';

import {
  generateMarketingKit,
} from './controllers/marketingController.js';

import { requireAuth } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KalaSetu backend is running.',
  });
});

app.use('/api/auth', authRoutes);

/*
  AI ROUTES
  Registered directly here for production reliability.
*/

app.post(
  '/api/ai/product-description',
  requireAuth,
  generateProductDescription
);

app.post(
  '/api/ai/pricing/suggest',
  requireAuth,
  generatePriceSuggestion
);

app.post(
  '/api/ai/marketing/generate',
  requireAuth,
  generateMarketingKit
);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found.',
  });
});

app.listen(PORT, () => {
  console.log(
    `KalaSetu backend running on http://localhost:${PORT}`
  );
});