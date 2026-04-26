const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: String,
    filename: String
  }],
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ business: 1, user: 1 }, { unique: true }); // One review per user per business
reviewSchema.index({ business: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware to update business rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    const Business = mongoose.model('Business');
    const stats = await mongoose.model('Review').aggregate([
      { $match: { business: this.business, status: 'approved' } },
      {
        $group: {
          _id: '$business',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await Business.findByIdAndUpdate(this.business, {
        'rating.average': Math.round(stats[0].avgRating * 10) / 10,
        'rating.count': stats[0].count,
        reviewCount: stats[0].count
      });
    }
  }
  next();
});

// Post-remove middleware to update business rating
reviewSchema.post('remove', async function() {
  const Business = mongoose.model('Business');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { business: this.business, status: 'approved' } },
    {
      $group: {
        _id: '$business',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Business.findByIdAndUpdate(this.business, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
      reviewCount: stats[0].count
    });
  } else {
    await Business.findByIdAndUpdate(this.business, {
      'rating.average': 0,
      'rating.count': 0,
      reviewCount: 0
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
