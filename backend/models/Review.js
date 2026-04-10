'use strict';
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  authorName:     { type: String, required: true, trim: true, maxlength: 80 },
  authorInitials: { type: String, maxlength: 3 },
  authorColor:    { type: String, default: '#378add' },
  rating:         { type: Number, required: true, min: 1, max: 5 },
  text:           { type: String, required: true, trim: true, maxlength: 1000 },
}, {
  timestamps: true,
});

// After saving a review, recalculate the parent business's rating + reviewCount
reviewSchema.post('save', async function () {
  const Business = mongoose.model('Business');
  const result = await mongoose.model('Review').aggregate([
    { $match: { business: this.business } },
    { $group: { _id: '$business', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length) {
    await Business.findByIdAndUpdate(this.business, {
      rating: Math.round(result[0].avg * 10) / 10,
      reviewCount: result[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
