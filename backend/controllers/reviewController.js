'use strict';
const Review   = require('../models/Review');
const Business = require('../models/Business');

const AVATAR_COLORS = [
  '#378add','#1d9e75','#ef9f27','#e24b4a',
  '#8e4ec6','#0a9e9e','#e2621b','#2e6da4',
];
const randomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// Generate initials from name e.g. "Priya Singh" → "PS"
const initials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');

// ─── GET /api/businesses/:id/reviews ──────────────────────────────────────────
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // Verify business exists
    const exists = await Business.exists({ _id: req.params.id });
    if (!exists) return res.status(404).json({ message: 'Business not found' });

    const [reviews, total] = await Promise.all([
      Review.find({ business: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ business: req.params.id }),
    ]);

    // Rating distribution
    const dist = await Review.aggregate([
      { $match: { business: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    const distribution = [5, 4, 3, 2, 1].map(r => ({
      stars: r,
      count: dist.find(d => d._id === r)?.count || 0,
    }));

    res.json({
      reviews,
      distribution,
      pagination: {
        page: pageNum, limit: limitNum, total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/businesses/:id/reviews ─────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { authorName, rating, text } = req.body;

    if (!authorName || !rating || !text) {
      return res.status(400).json({ message: 'authorName, rating, and text are required' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const review = await Review.create({
      business: req.params.id,
      authorName,
      authorInitials: initials(authorName),
      authorColor:    randomColor(),
      rating:         parseInt(rating, 10),
      text,
    });

    // Note: post-save hook on Review handles rating recalculation
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};
