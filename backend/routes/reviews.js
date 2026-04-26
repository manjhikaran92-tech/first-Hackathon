const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Business = require('../models/Business');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for review images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/reviews/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get reviews for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const reviews = await Review.find({ 
      business: businessId,
      status: 'approved'
    })
    .populate('user', 'name avatar')
    .populate('response.author', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      business: businessId,
      status: 'approved'
    });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { business: mongoose.Types.ObjectId(businessId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        ratingStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get reviews by user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Users can only see their own reviews unless they're admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view these reviews'
      });
    }

    const reviews = await Review.find({ user: userId })
      .populate('business', 'name category images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: userId });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new review
router.post('/', protect, upload.array('images', 3), async (req, res) => {
  try {
    const { business, rating, title, comment } = req.body;

    // Check if business exists
    const businessDoc = await Business.findById(business);
    if (!businessDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    // Check if user already reviewed this business
    const existingReview = await Review.findOne({ business, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this business'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/reviews/${file.filename}`,
          filename: file.filename
        });
      });
    }

    const review = await Review.create({
      business,
      user: req.user.id,
      rating: parseInt(rating),
      title,
      comment,
      images
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('business', 'name');

    res.status(201).json({
      status: 'success',
      data: { review: populatedReview }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this review'
      });
    }

    const { rating, title, comment } = req.body;
    const updateData = {};
    if (rating) updateData.rating = parseInt(rating);
    if (title) updateData.title = title;
    if (comment) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'name avatar')
    .populate('business', 'name');

    res.status(200).json({
      status: 'success',
      data: { review: updatedReview }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mark review as helpful/not helpful
router.put('/:id/helpful', protect, async (req, res) => {
  try {
    const { type } = req.body; // 'helpful' or 'notHelpful'

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    if (type === 'helpful') {
      review.helpful += 1;
    } else if (type === 'notHelpful') {
      review.notHelpful += 1;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid type. Must be helpful or notHelpful'
      });
    }

    await review.save();

    res.status(200).json({
      status: 'success',
      data: { helpful: review.helpful, notHelpful: review.notHelpful }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add response to review (business owner only)
router.post('/:id/response', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Response text is required'
      });
    }

    const review = await Review.findById(req.params.id).populate('business');
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user is the business owner
    if (review.business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only business owners can respond to reviews'
      });
    }

    review.response = {
      text,
      author: req.user.id,
      createdAt: new Date()
    };

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('business', 'name')
      .populate('response.author', 'name');

    res.status(200).json({
      status: 'success',
      data: { review: populatedReview }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
