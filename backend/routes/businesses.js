const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/businesses/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// ✅ Get all businesses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, area, search, rating, verified, featured, open, sort = 'createdAt', order = 'desc' } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;
    if (area) query.area = area;
    if (verified === 'true') query.verified = true;
    if (featured === 'true') query.featured = true;
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };
    if (search) query.$text = { $search: search };

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const businesses = await Business.find(query)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    let filteredBusinesses = businesses;
    if (open === 'true') {
      filteredBusinesses = businesses.filter(business => business.isOpen);
    }

    const total = await Business.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        businesses: filteredBusinesses,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Get featured businesses - BEFORE /:id
router.get('/featured', async (req, res) => {
  try {
    const businesses = await Business.find({ featured: true, status: 'active' })
      .populate('owner', 'name')
      .sort({ 'rating.average': -1 })
      .limit(12);

    res.status(200).json({ status: 'success', data: { businesses } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Get my businesses - BEFORE /:id
router.get('/my', protect, async (req, res) => {
  try {
    const businesses = await Business.find({
      owner: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', data: { businesses } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Search businesses - BEFORE /:id
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const businesses = await Business.find({
      $text: { $search: query },
      status: 'active'
    })
    .populate('owner', 'name')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Business.countDocuments({ $text: { $search: query }, status: 'active' });

    res.status(200).json({
      status: 'success',
      data: { businesses, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Get business by ID - AFTER all static routes
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }

    await Business.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.status(200).json({ status: 'success', data: { business } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Create business
router.post('/', protect, upload.array('images', 6), async (req, res) => {
  try {
    const businessData = { ...req.body };

    if (req.files && req.files.length > 0) {
      businessData.images = req.files.map((file, index) => ({
        url: `/uploads/businesses/${file.filename}`,
        filename: file.filename,
        isPrimary: index === 0
      }));
    }

    businessData.owner = req.user.id;
    const business = await Business.create(businessData);

    req.user.businesses.push(business._id);
    await req.user.save();

    res.status(201).json({ status: 'success', data: { business } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ✅ Update business
router.put('/:id', protect, upload.array('images', 6), async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file, index) => ({
        url: `/uploads/businesses/${file.filename}`,
        filename: file.filename,
        isPrimary: index === 0
      }));
    }

    business = await Business.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('owner', 'name email');

    res.status(200).json({ status: 'success', data: { business } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ✅ Delete business
router.delete('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ status: 'error', message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    business.status = 'inactive';
    await business.save();

    req.user.businesses = req.user.businesses.filter(
      biz => biz.toString() !== business._id.toString()
    );
    await req.user.save();

    res.status(200).json({ status: 'success', message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ View count
router.post('/:id/view', async (req, res) => {
  try {
    await Business.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;