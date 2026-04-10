'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const businessRoutes = require('./routes/businessRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logging (dev) ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/businesses', businessRoutes);
app.use('/api/businesses', reviewRoutes);   // nested: /api/businesses/:id/reviews

// Site-wide stats
const Business = require('./models/Business');
const Review = require('./models/Review');
app.get('/api/stats', async (_req, res, next) => {
  try {
    const [totalBusinesses, totalReviews] = await Promise.all([
      Business.countDocuments(),
      Review.countDocuments(),
    ]);
    const categories = await Business.distinct('tag');
    res.json({
      totalBusinesses,
      totalReviews,
      totalCategories: categories.length,
      monthlyVisitors: 18000 // can be replaced with analytics data
    });
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`\n ✅  CityFind API running → http://localhost:${PORT}/api\n`);
});

module.exports = app;
