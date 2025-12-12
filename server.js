import express from 'express';
import cors from 'cors';
import restaurantHandler from './api/restaurant.js';
import dishesHandler from './api/dishes.js';
import billsHandler from './api/bills.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - wrap Vercel-style handlers for Express
app.all('/api/restaurant', async (req, res) => {
  await restaurantHandler(req, res);
});

app.all('/api/dishes', async (req, res) => {
  await dishesHandler(req, res);
});

app.all('/api/bills', async (req, res) => {
  await billsHandler(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
});
