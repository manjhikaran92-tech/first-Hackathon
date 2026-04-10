'use strict';
const mongoose = require('mongoose');

const hourSchema = new mongoose.Schema({
  open:  { type: String, default: 'Closed' },
  close: { type: String, default: 'Closed' },
  is24h: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
}, { _id: false });

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [120, 'Name must be 120 chars or fewer'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  tag: {
    type: String,
    required: true,
    enum: ['food', 'health', 'edu', 'bank', 'shop', 'trans', 'govt', 'hotel', 'salon', 'legal', 'it', 'other'],
    lowercase: true,
  },
  emoji:       { type: String, default: '🏪' },
  bgColor:     { type: String, default: '#f5f4f0' },

  // Descriptions
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [300, 'Short description max 300 chars'],
    trim: true,
  },
  longDescription: { type: String, trim: true },

  // Tags / services
  serviceTags: [{ type: String, trim: true }],

  // Location
  address: { type: String, required: true, trim: true },
  area:    {
    type: String,
    required: true,
    enum: ['Bistupur', 'Sakchi', 'Telco', 'Jugsalai', 'Mango', 'Adityapur', 'Other'],
  },
  pincode: { type: String, default: '831001', trim: true },
  city:    { type: String, default: 'Jamshedpur', trim: true },
  lat:     { type: Number },
  lng:     { type: Number },

  // Contact
  phone:   { type: String, trim: true },
  email:   { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },

  // Status flags
  isOpen:     { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  // Plan
  plan: {
    type: String,
    enum: ['basic', 'pro'],
    default: 'basic',
  },

  // Hours (mon–sun)
  hours: {
    mon: { type: hourSchema, default: {} },
    tue: { type: hourSchema, default: {} },
    wed: { type: hourSchema, default: {} },
    thu: { type: hourSchema, default: {} },
    fri: { type: hourSchema, default: {} },
    sat: { type: hourSchema, default: {} },
    sun: { type: hourSchema, default: {} },
  },

  // Computed rating (denormalised for performance)
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

  photos: [{ type: String }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Text index for full-text search
businessSchema.index({ name: 'text', description: 'text', category: 'text' });

// Compound index for common filter queries
businessSchema.index({ tag: 1, area: 1, rating: -1 });

module.exports = mongoose.model('Business', businessSchema);
