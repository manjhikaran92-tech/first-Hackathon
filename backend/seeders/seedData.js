const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const User = require('../models/User');
const Category = require('../models/Category');
const Review = require('../models/Review');

// Category map
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

// Sample categories
const categories = [
  { name: 'Food & Dining', slug: 'food', emoji: '🍽️', color: '#faeeda', description: 'Restaurants, cafes, and food services', order: 1 },
  { name: 'Healthcare', slug: 'health', emoji: '🏥', color: '#eaf3de', description: 'Hospitals, clinics, and medical services', order: 2 },
  { name: 'Education', slug: 'education', emoji: '🎓', color: '#fbeaf0', description: 'Schools, colleges, and educational institutions', order: 3 },
  { name: 'Banking & Finance', slug: 'banking', emoji: '🏦', color: '#e6f1fb', description: 'Banks, ATMs, and financial services', order: 4 },
  { name: 'Shopping', slug: 'shopping', emoji: '🛍️', color: '#eaf3de', description: 'Retail stores and shopping centers', order: 5 },
  { name: 'Transportation', slug: 'transport', emoji: '🚗', color: '#faece7', description: 'Transport services and vehicle rentals', order: 6 },
  { name: 'Government', slug: 'government', emoji: '🏛️', color: '#f0e6ff', description: 'Government offices and public services', order: 7 },
  { name: 'Hotels', slug: 'hotel', emoji: '🏨', color: '#ffe6e6', description: 'Hotels and accommodation services', order: 8 },
  { name: 'Salons & Spa', slug: 'salon', emoji: '✂️', color: '#ffe6f0', description: 'Beauty salons and spa services', order: 9 },
  { name: 'Legal Services', slug: 'legal', emoji: '⚖️', color: '#e6f3ff', description: 'Law firms and legal consultants', order: 10 },
  { name: 'IT & Technology', slug: 'it', emoji: '💻', color: '#f0f0ff', description: 'IT services and technology solutions', order: 11 },
  { name: 'Other', slug: 'other', emoji: '📌', color: '#f5f5f5', description: 'Other services and businesses', order: 12 }
];

// Sample businesses
const businesses = [
  {
    name: 'Tata Main Hospital',
    description: 'Multi-speciality hospital with 24/7 emergency care, ICU, and over 40 departments.',
    category: 'health',
    categoryName: 'Healthcare',
    area: 'Bistupur',
    address: 'C Road, Bistupur',
    phone: '9123456789',
    email: 'info@tmh.com',
    website: 'https://www.tmh.com',
    coordinates: { lat: 22.8046, lng: 86.2029 },
    verified: true,
    featured: true,
    operatingHours: {
      monday: { open: '00:00', close: '23:59', closed: false },
      tuesday: { open: '00:00', close: '23:59', closed: false },
      wednesday: { open: '00:00', close: '23:59', closed: false },
      thursday: { open: '00:00', close: '23:59', closed: false },
      friday: { open: '00:00', close: '23:59', closed: false },
      saturday: { open: '00:00', close: '23:59', closed: false },
      sunday: { open: '00:00', close: '23:59', closed: false }
    },
    services: ['Emergency Care', 'ICU', 'Surgery', 'Cardiology', 'Neurology', 'Pediatrics'],
    amenities: ['24/7 Emergency', 'Parking', 'Pharmacy', 'Cafeteria', 'WiFi'],
    tags: ['hospital', 'emergency', 'healthcare', 'multi-speciality']
  },
  {
    name: 'Hotel Kaveri',
    description: 'Family restaurant serving authentic Indian and Chinese cuisine. Known for thali meals.',
    category: 'food',
    categoryName: 'Food & Dining',
    area: 'Sakchi',
    address: 'Main Road, Sakchi',
    phone: '9234567890',
    verified: true,
    featured: true,
    coordinates: { lat: 22.7932, lng: 86.1851 },
    operatingHours: {
      monday: { open: '11:00', close: '23:00', closed: false },
      tuesday: { open: '11:00', close: '23:00', closed: false },
      wednesday: { open: '11:00', close: '23:00', closed: false },
      thursday: { open: '11:00', close: '23:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:30', closed: false },
      sunday: { open: '11:00', close: '23:30', closed: false }
    },
    services: ['Dine-in', 'Takeaway', 'Home Delivery', 'Catering'],
    amenities: ['AC Dining', 'Family Section', 'Party Hall', 'Parking'],
    priceRange: '$$',
    tags: ['restaurant', 'indian', 'chinese', 'family', 'thali']
  },
  {
    name: 'SBI Main Branch',
    description: 'State Bank of India main Jamshedpur branch. All banking, loans and forex services.',
    category: 'banking',
    categoryName: 'Banking & Finance',
    area: 'Bistupur',
    address: 'Bistupur Market Area',
    phone: '9345678901',
    verified: true,
    featured: false,
    coordinates: { lat: 22.8051, lng: 86.2045 },
    operatingHours: {
      monday: { open: '10:00', close: '16:00', closed: false },
      tuesday: { open: '10:00', close: '16:00', closed: false },
      wednesday: { open: '10:00', close: '16:00', closed: true },
      thursday: { open: '10:00', close: '16:00', closed: false },
      friday: { open: '10:00', close: '16:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    services: ['Banking', 'Loans', 'Forex', 'ATM', 'Locker Facility'],
    amenities: ['ATM', 'Parking', 'WiFi'],
    tags: ['bank', 'sbi', 'banking', 'atm', 'loans']
  },
  {
    name: 'DPS Jamshedpur',
    description: 'Premier CBSE school offering classes I-XII with science, commerce and arts streams.',
    category: 'education',
    categoryName: 'Education',
    area: 'Telco',
    address: 'Telco Colony',
    phone: '9456789012',
    email: 'info@dpsjamshedpur.com',
    website: 'https://www.dpsjamshedpur.com',
    verified: true,
    featured: true,
    coordinates: { lat: 22.7714, lng: 86.2109 },
    operatingHours: {
      monday: { open: '08:00', close: '15:00', closed: false },
      tuesday: { open: '08:00', close: '15:00', closed: false },
      wednesday: { open: '08:00', close: '15:00', closed: false },
      thursday: { open: '08:00', close: '15:00', closed: false },
      friday: { open: '08:00', close: '15:00', closed: false },
      saturday: { open: '08:00', close: '13:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    services: ['Education', 'Sports', 'Arts', 'Science Labs', 'Library'],
    amenities: ['Playground', 'Library', 'Science Labs', 'Computer Lab', 'Auditorium'],
    tags: ['school', 'cbse', 'education', 'sports', 'library']
  },
  {
    name: 'Big Bazaar Jugsalai',
    description: 'India largest hypermarket chain. Grocery, electronics, clothing under one roof.',
    category: 'shopping',
    categoryName: 'Shopping',
    area: 'Jugsalai',
    address: 'Jugsalai Main Road',
    phone: '9567890123',
    verified: false,
    featured: false,
    coordinates: { lat: 22.7849, lng: 86.1897 },
    operatingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    },
    services: ['Retail', 'Grocery', 'Electronics', 'Clothing', 'Home Appliances'],
    amenities: ['Parking', 'Food Court', 'ATM', 'Customer Service'],
    priceRange: '$$',
    tags: ['hypermarket', 'grocery', 'electronics', 'clothing', 'shopping']
  },
  {
    name: 'Apollo Clinic',
    description: 'Multi-specialty clinic with experienced doctors for general and specialist consultations.',
    category: 'health',
    categoryName: 'Healthcare',
    area: 'Bistupur',
    address: 'Bistupur, Near Post Office',
    phone: '9678901234',
    verified: true,
    featured: false,
    coordinates: { lat: 22.8039, lng: 86.2056 },
    operatingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '14:00', closed: false }
    },
    services: ['General Medicine', 'Specialist Consultation', 'Lab Tests', 'Pharmacy'],
    amenities: ['Parking', 'Pharmacy', 'Lab', 'WiFi'],
    tags: ['clinic', 'healthcare', 'medicine', 'consultation']
  },
  {
    name: 'City Taxi Services',
    description: 'Reliable local taxi services across Jamshedpur at affordable rates.',
    category: 'transport',
    categoryName: 'Transportation',
    area: 'Mango',
    address: 'Mango Bus Stand',
    phone: '9789012345',
    verified: false,
    featured: false,
    coordinates: { lat: 22.7821, lng: 86.2156 },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    services: ['Local Taxi', 'Airport Drop', 'Outstation', 'Corporate'],
    amenities: ['AC Cabs', 'Online Booking', '24/7 Support'],
    priceRange: '$',
    tags: ['taxi', 'transport', 'cab', 'local']
  },
  {
    name: 'Dimna Dhaba',
    description: 'Iconic roadside dhaba near Dimna Lake famous for dal-baati and litti chokha.',
    category: 'food',
    categoryName: 'Food & Dining',
    area: 'Telco',
    address: 'Dimna Lake Road, Telco',
    phone: '9890123456',
    verified: false,
    featured: false,
    coordinates: { lat: 22.7654, lng: 86.2234 },
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '23:00', closed: false },
      sunday: { open: '08:00', close: '23:00', closed: false }
    },
    services: ['Dine-in', 'Takeaway'],
    amenities: ['Outdoor Seating', 'Parking'],
    priceRange: '$',
    tags: ['dhaba', 'food', 'litti', 'dal-baati', 'local']
  },
  {
    name: 'HDFC Bank Sakchi',
    description: '24/7 ATM and full banking services including locker facility and home loans.',
    category: 'banking',
    categoryName: 'Banking & Finance',
    area: 'Sakchi',
    address: 'Sakchi Market Complex',
    phone: '9901234567',
    verified: true,
    featured: false,
    coordinates: { lat: 22.7945, lng: 86.1867 },
    operatingHours: {
      monday: { open: '10:00', close: '16:00', closed: false },
      tuesday: { open: '10:00', close: '16:00', closed: false },
      wednesday: { open: '10:00', close: '16:00', closed: false },
      thursday: { open: '10:00', close: '16:00', closed: false },
      friday: { open: '10:00', close: '16:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    services: ['Banking', 'ATM', 'Home Loans', 'Locker', 'Net Banking'],
    amenities: ['ATM', 'Parking', 'WiFi', 'AC'],
    tags: ['hdfc', 'bank', 'atm', 'loans']
  },
  {
    name: 'Jamshedpur Public Library',
    description: 'City main public library with over 50,000 books, e-resources and reading rooms.',
    category: 'education',
    categoryName: 'Education',
    area: 'Bistupur',
    address: 'Bistupur Cooperative Colony',
    phone: '9012345678',
    verified: true,
    featured: false,
    coordinates: { lat: 22.8033, lng: 86.2041 },
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    services: ['Book Lending', 'Reading Room', 'E-Resources', 'Children Section'],
    amenities: ['WiFi', 'AC Reading Room', 'Parking', 'Cafeteria'],
    priceRange: '$',
    tags: ['library', 'books', 'education', 'reading']
  }
];

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@cityfind.com',
    password: 'Admin123',
    role: 'admin',
    phone: '9876543210',
    isVerified: true
  },
  {
    name: 'John Business',
    email: 'john@business.com',
    password: 'Business123',
    role: 'business_owner',
    phone: '9876543211',
    isVerified: true
  },
  {
    name: 'Jane User',
    email: 'jane@user.com',
    password: 'User123',
    role: 'user',
    phone: '9876543212',
    isVerified: true
  }
];

// Sample reviews
const reviews = [
  {
    rating: 5,
    title: 'Excellent Service',
    comment: 'Amazing experience! The staff was very helpful and professional. Highly recommend this place to everyone.',
    helpful: 12,
    notHelpful: 1
  },
  {
    rating: 4,
    title: 'Good Experience',
    comment: 'Had a good experience overall. The service was prompt and the quality was satisfactory.',
    helpful: 8,
    notHelpful: 2
  },
  {
    rating: 3,
    title: 'Average Service',
    comment: 'Service was okay but nothing exceptional. There is room for improvement.',
    helpful: 3,
    notHelpful: 3
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cityfind');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Business.deleteMany({});
    await Review.deleteMany({});
    console.log('Database cleared');

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log(`${createdCategories.length} categories created`);

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Create businesses
    const businessesWithOwners = businesses.map((business) => ({
      ...business,
      categoryName: categoryMap[business.category] || 'Other',
      owner: createdUsers[1]._id
    }));

    const createdBusinesses = await Business.create(businessesWithOwners);
    console.log(`${createdBusinesses.length} businesses created`);

    // Create reviews
    const reviewsWithData = reviews.map((review, index) => ({
      ...review,
      business: createdBusinesses[index % createdBusinesses.length]._id,
      user: createdUsers[2]._id
    }));

    const createdReviews = await Review.create(reviewsWithData);
    console.log(`${createdReviews.length} reviews created`);

    // Update business ratings
    for (const business of createdBusinesses) {
      const stats = await Review.aggregate([
        { $match: { business: business._id, status: 'approved' } },
        {
          $group: {
            _id: '$business',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Business.findByIdAndUpdate(business._id, {
          'rating.average': Math.round(stats[0].avgRating * 10) / 10,
          'rating.count': stats[0].count,
          reviewCount: stats[0].count
        });
      }
    }

    console.log('Database seeded successfully! 🎉');
    console.log('\nLogin Credentials:');
    console.log('Admin:          admin@cityfind.com / Admin123');
    console.log('Business Owner: john@business.com / Business123');
    console.log('User:           jane@user.com / User123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = seedDatabase;