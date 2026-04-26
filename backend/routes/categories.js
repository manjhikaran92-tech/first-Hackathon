const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Business = require('../models/Business');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, emoji, color, description, order } = req.body;

    const category = await Category.create({
      name,
      emoji,
      color,
      description,
      order: order || 0
    });

    res.status(201).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, emoji, color, description, order, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, emoji, color, description, order, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if category has businesses
    const businessCount = await Business.countDocuments({ category: category.slug });
    if (businessCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with existing businesses'
      });
    }

    await category.remove();

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get category statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Business.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'slug',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          category: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          emoji: '$categoryInfo.emoji',
          color: '$categoryInfo.color',
          businessCount: '$count',
          averageRating: { $round: ['$avgRating', 1] }
        }
      },
      { $sort: { businessCount: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
