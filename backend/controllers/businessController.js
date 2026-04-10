'use strict';
const Business = require('../models/Business');

// ─── GET /api/businesses ──────────────────────────────────────────────────────
// Query params: q, cat, area, open, verified, minRating, sort, page, limit
exports.getBusinesses = async (req, res, next) => {
  try {
    const {
      q, cat, area, open, verified,
      minRating, sort = 'rating', page = 1, limit = 12,
    } = req.query;

    const filter = {};

    // Full-text search
    if (q && q.trim()) {
      filter.$or = [
        { name:        { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { category:    { $regex: q.trim(), $options: 'i' } },
        { area:        { $regex: q.trim(), $options: 'i' } },
      ];
    }

    // Category tag filter (comma-separated: ?cat=food,health)
    if (cat) {
      const cats = cat.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length) filter.tag = { $in: cats };
    }

    // Area filter (comma-separated)
    if (area) {
      const areas = area.split(',').map(a => a.trim()).filter(Boolean);
      if (areas.length) filter.area = { $in: areas };
    }

    if (open === 'true')     filter.isOpen     = true;
    if (open === 'false')    filter.isOpen     = false;
    if (verified === 'true') filter.isVerified = true;

    if (minRating) {
      const r = parseFloat(minRating);
      if (!isNaN(r)) filter.rating = { $gte: r };
    }

    // URL filter param (e.g. ?filter=top)
    if (req.query.filter === 'top')  filter.rating  = { ...(filter.rating || {}), $gte: 4 };
    if (req.query.filter === 'new')  Object.assign(filter, {}); // handled by sort

    // Sort
    const sortMap = {
      rating:  { rating: -1 },
      name:    { name: 1 },
      reviews: { reviewCount: -1 },
      new:     { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.rating;
    if (req.query.filter === 'new') Object.assign(sortObj, { createdAt: -1 });

    // Pagination
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [businesses, total] = await Promise.all([
      Business.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Business.countDocuments(filter),
    ]);

    res.json({
      businesses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/businesses/featured ─────────────────────────────────────────────
exports.getFeatured = async (_req, res, next) => {
  try {
    const businesses = await Business.find({})
      .sort({ isFeatured: -1, rating: -1 })
      .limit(6)
      .lean();
    res.json({ businesses });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/businesses/:id ──────────────────────────────────────────────────
exports.getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json({ business });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/businesses/:id/nearby ───────────────────────────────────────────
exports.getNearby = async (req, res, next) => {
  try {
    const current = await Business.findById(req.params.id).lean();
    if (!current) return res.status(404).json({ message: 'Business not found' });

    // Find others in the same area or same tag, excluding self
    const businesses = await Business.find({
      _id:  { $ne: current._id },
      $or: [{ area: current.area }, { tag: current.tag }],
    })
      .sort({ rating: -1 })
      .limit(3)
      .lean();

    res.json({ businesses });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/businesses ─────────────────────────────────────────────────────
exports.createBusiness = async (req, res, next) => {
  try {
    const {
      name, category, tag, description, phone, email, website,
      address, area, pincode, hours,
    } = req.body;

    // Emoji + bgColor derived from tag
    const tagMeta = {
      food:  { emoji: '🍽️', bgColor: '#faeeda' },
      health:{ emoji: '🏥', bgColor: '#eaf3de' },
      edu:   { emoji: '🎓', bgColor: '#fbeaf0' },
      bank:  { emoji: '🏦', bgColor: '#e6f1fb' },
      shop:  { emoji: '🛍️', bgColor: '#eaf3de' },
      trans: { emoji: '🚗', bgColor: '#faece7' },
      govt:  { emoji: '🏛️', bgColor: '#e8e6f0' },
      hotel: { emoji: '🏨', bgColor: '#faeeda' },
      salon: { emoji: '✂️', bgColor: '#fbeaf0' },
      legal: { emoji: '⚖️', bgColor: '#e6f1fb' },
      it:    { emoji: '💻', bgColor: '#eaf3de' },
      other: { emoji: '🏪', bgColor: '#f5f4f0' },
    };
    const meta = tagMeta[tag] || tagMeta.other;

    const business = await Business.create({
      name, category, tag, description, phone, email, website,
      address, area, pincode, hours,
      emoji: meta.emoji, bgColor: meta.bgColor,
      isOpen: true, isVerified: false, isFeatured: false, plan: 'basic',
    });

    res.status(201).json({ business });
  } catch (err) {
    next(err);
  }
};
