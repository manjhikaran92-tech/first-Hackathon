const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'food', 'health', 'education', 'banking', 'shopping',
      'transport', 'government', 'hotel', 'salon', 'legal', 'it', 'other'
    ]
  },
  categoryName: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    enum: ['Bistupur', 'Sakchi', 'Telco', 'Jugsalai', 'Mango', 'Other']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  },
  coordinates: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 }
  },
  images: [{
    url: String,
    filename: String,
    isPrimary: { type: Boolean, default: false }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  services: [String],
  amenities: [String],
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$'
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  tags: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Fixed - isOpen virtual
businessSchema.virtual('isOpen').get(function() {
  if (!this.operatingHours) return false;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const day = days[now.getDay()]; // ✅ Sahi din
  const currentTime = now.toTimeString().slice(0, 5);

  const dayHours = this.operatingHours[day];
  if (!dayHours || dayHours.closed) return false;

  return currentTime >= dayHours.open && currentTime <= dayHours.close;
});

// Indexes
businessSchema.index({ name: 'text', description: 'text' });
businessSchema.index({ category: 1, area: 1 });
businessSchema.index({ coordinates: '2dsphere' });
businessSchema.index({ 'rating.average': -1 });
businessSchema.index({ verified: 1, featured: 1 });
businessSchema.index({ owner: 1 });

// Pre-save middleware
businessSchema.pre('save', function(next) {
  const categoryMap = {
    'food': 'Food & Dining',
    'health': 'Healthcare',
    'education': 'Education',
    'banking': 'Banking & Finance',
    'shopping': 'Shopping',
    'transport': 'Transportation',
    'government': 'Government',
    'hotel': 'Hotels',
    'salon': 'Salons & Spa',
    'legal': 'Legal Services',
    'it': 'IT & Technology',
    'other': 'Other'
  };

  this.categoryName = categoryMap[this.category] || 'Other';
  next();
});

module.exports = mongoose.model('Business', businessSchema);