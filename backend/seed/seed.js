'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Review   = require('../models/Review');

const BUSINESS_SEED = [
  {
    name: 'Tata Main Hospital',
    category: 'Healthcare', tag: 'health',
    emoji: '🏥', bgColor: '#eaf3de',
    description: 'Multi-speciality hospital with 24/7 emergency care, ICU, and over 40 departments.',
    longDescription: `Tata Main Hospital is Jamshedpur's premier multi-specialty medical facility, established in 1917. It serves as the primary healthcare provider for the region with over 850 beds and more than 40 specialized departments including Cardiology, Oncology, Neurology, Orthopedics, and Pediatrics.\n\nThe hospital offers 24/7 emergency services, a dedicated ICU, advanced diagnostic imaging, and a blood bank. It is widely recognized for its patient-centric approach and modern medical infrastructure.`,
    serviceTags: ['Emergency Care', 'ICU', 'Cardiology', 'Oncology', 'Pediatrics', 'Blood Bank', 'Pharmacy'],
    address: 'C Road, Bistupur', area: 'Bistupur', pincode: '831001',
    phone: '+916572345678', email: 'info@tatahospital.in', website: 'www.tatahospital.in',
    lat: 22.8046, lng: 86.2029,
    isOpen: true, isVerified: true, isFeatured: true, plan: 'pro',
    rating: 4.6, reviewCount: 312,
    hours: {
      mon: { is24h: true }, tue: { is24h: true }, wed: { is24h: true },
      thu: { is24h: true }, fri: { is24h: true }, sat: { is24h: true }, sun: { is24h: true },
    },
  },
  {
    name: 'Hotel Kaveri',
    category: 'Restaurant & Hotel', tag: 'food',
    emoji: '🍽️', bgColor: '#faeeda',
    description: 'Family restaurant serving authentic Indian and Chinese cuisine. Known for thali meals.',
    longDescription: 'Hotel Kaveri has been serving Jamshedpur residents since 1985. Known for its authentic North Indian thalis and Chinese dishes, it remains a favourite for families and corporate lunches alike. The restaurant seats 120 guests across two floors with a dedicated banquet hall.',
    serviceTags: ['North Indian', 'Chinese', 'Thali', 'Banquet Hall', 'Home Delivery'],
    address: 'Main Road, Sakchi', area: 'Sakchi', pincode: '831001',
    phone: '+916572219876', email: 'contact@hotelkaveri.in',
    lat: 22.7932, lng: 86.1851,
    isOpen: true, isVerified: true, isFeatured: true, plan: 'pro',
    rating: 4.3, reviewCount: 189,
    hours: {
      mon: { open: '10:00 AM', close: '10:00 PM' }, tue: { open: '10:00 AM', close: '10:00 PM' },
      wed: { open: '10:00 AM', close: '10:00 PM' }, thu: { open: '10:00 AM', close: '10:00 PM' },
      fri: { open: '10:00 AM', close: '11:00 PM' }, sat: { open: '10:00 AM', close: '11:00 PM' },
      sun: { open: '11:00 AM', close: '10:00 PM' },
    },
  },
  {
    name: 'SBI Main Branch',
    category: 'Banking & Finance', tag: 'bank',
    emoji: '🏦', bgColor: '#e6f1fb',
    description: "State Bank of India's main Jamshedpur branch. All banking, loans and forex services.",
    longDescription: "State Bank of India's main Jamshedpur branch offers comprehensive banking services including savings and current accounts, personal and home loans, forex exchange, and government scheme disbursements.",
    serviceTags: ['Savings Accounts', 'Home Loans', 'Forex', 'ATM', 'Govt Schemes'],
    address: 'Bistupur Market Area', area: 'Bistupur', pincode: '831001',
    phone: '+916572223400', email: 'sbi.jamshedpur@sbi.co.in',
    lat: 22.8051, lng: 86.2045,
    isOpen: false, isVerified: true, isFeatured: false, plan: 'basic',
    rating: 3.9, reviewCount: 421,
    hours: {
      mon: { open: '9:30 AM', close: '4:00 PM' }, tue: { open: '9:30 AM', close: '4:00 PM' },
      wed: { open: '9:30 AM', close: '4:00 PM' }, thu: { open: '9:30 AM', close: '4:00 PM' },
      fri: { open: '9:30 AM', close: '4:00 PM' }, sat: { open: '9:30 AM', close: '1:00 PM' },
      sun: { isClosed: true },
    },
  },
  {
    name: 'DPS Jamshedpur',
    category: 'Education', tag: 'edu',
    emoji: '🎓', bgColor: '#fbeaf0',
    description: 'Premier CBSE school offering classes I-XII with science, commerce and arts streams.',
    longDescription: 'Delhi Public School Jamshedpur is one of the top-rated CBSE schools in Jharkhand. Established in 1982, it offers state-of-the-art facilities including smart classrooms, a fully equipped science lab, swimming pool, and sports grounds.',
    serviceTags: ['CBSE', 'Science', 'Commerce', 'Arts', 'Sports', 'Swimming Pool'],
    address: 'Telco Colony', area: 'Telco', pincode: '831004',
    phone: '+916572277000', email: 'dpsjsr@dpsjsr.edu.in', website: 'www.dpsjsr.edu.in',
    lat: 22.7714, lng: 86.2109,
    isOpen: true, isVerified: true, isFeatured: true, plan: 'pro',
    rating: 4.8, reviewCount: 204,
    hours: {
      mon: { open: '7:30 AM', close: '2:30 PM' }, tue: { open: '7:30 AM', close: '2:30 PM' },
      wed: { open: '7:30 AM', close: '2:30 PM' }, thu: { open: '7:30 AM', close: '2:30 PM' },
      fri: { open: '7:30 AM', close: '2:30 PM' }, sat: { open: '8:00 AM', close: '1:00 PM' },
      sun: { isClosed: true },
    },
  },
  {
    name: 'Big Bazaar Jugsalai',
    category: 'Shopping', tag: 'shop',
    emoji: '🛍️', bgColor: '#eaf3de',
    description: "India's largest hypermarket chain. Grocery, electronics, clothing under one roof.",
    longDescription: 'Big Bazaar Jugsalai is spread across 35,000 sq.ft offering everything from fresh groceries and FMCG to electronics, apparel, and home furnishings. The store runs frequent sales and accepts all payment modes.',
    serviceTags: ['Grocery', 'Electronics', 'Apparel', 'Home Goods', 'Parking', 'Food Court'],
    address: 'Jugsalai Main Road', area: 'Jugsalai', pincode: '831006',
    phone: '+916572234000',
    lat: 22.7849, lng: 86.1897,
    isOpen: true, isVerified: false, isFeatured: false, plan: 'basic',
    rating: 4.1, reviewCount: 678,
    hours: {
      mon: { open: '10:00 AM', close: '9:00 PM' }, tue: { open: '10:00 AM', close: '9:00 PM' },
      wed: { open: '10:00 AM', close: '9:00 PM' }, thu: { open: '10:00 AM', close: '9:00 PM' },
      fri: { open: '10:00 AM', close: '9:30 PM' }, sat: { open: '9:00 AM', close: '10:00 PM' },
      sun: { open: '9:00 AM', close: '10:00 PM' },
    },
  },
  {
    name: 'Apollo Clinic',
    category: 'Healthcare', tag: 'health',
    emoji: '🩺', bgColor: '#eaf3de',
    description: 'Multi-specialty clinic with experienced doctors for general and specialist consultations.',
    longDescription: 'Apollo Clinic Bistupur is part of the Apollo Hospitals network, offering primary and specialist outpatient care with digital health records and online appointment booking. Departments include General Medicine, Dermatology, Cardiology, and Orthopaedics.',
    serviceTags: ['OPD', 'Dermatology', 'Cardiology', 'Lab Tests', 'Online Booking'],
    address: 'Bistupur, Near Post Office', area: 'Bistupur', pincode: '831001',
    phone: '+916572290000', email: 'bistupur@apolloclinic.com',
    lat: 22.8039, lng: 86.2056,
    isOpen: true, isVerified: true, isFeatured: true, plan: 'pro',
    rating: 4.5, reviewCount: 156,
    hours: {
      mon: { open: '8:00 AM', close: '8:00 PM' }, tue: { open: '8:00 AM', close: '8:00 PM' },
      wed: { open: '8:00 AM', close: '8:00 PM' }, thu: { open: '8:00 AM', close: '8:00 PM' },
      fri: { open: '8:00 AM', close: '8:00 PM' }, sat: { open: '8:00 AM', close: '6:00 PM' },
      sun: { open: '9:00 AM', close: '2:00 PM' },
    },
  },
  {
    name: 'City Taxi Services',
    category: 'Transport', tag: 'trans',
    emoji: '🚗', bgColor: '#faece7',
    description: 'Reliable local taxi services across Jamshedpur at affordable rates.',
    longDescription: 'City Taxi Services operates a fleet of 40+ air-conditioned cabs available 24/7. We offer point-to-point city rides, airport transfers, and outstation bookings. Book by call or WhatsApp.',
    serviceTags: ['City Rides', 'Airport Transfer', 'Outstation', 'AC Cabs', '24/7'],
    address: 'Mango Bus Stand', area: 'Mango', pincode: '831012',
    phone: '+919876543210',
    lat: 22.8012, lng: 86.1756,
    isOpen: true, isVerified: false, isFeatured: false, plan: 'basic',
    rating: 3.7, reviewCount: 95,
    hours: { mon: { is24h: true }, tue: { is24h: true }, wed: { is24h: true }, thu: { is24h: true }, fri: { is24h: true }, sat: { is24h: true }, sun: { is24h: true } },
  },
  {
    name: 'Jamshedpur Public Library',
    category: 'Education', tag: 'edu',
    emoji: '📚', bgColor: '#fbeaf0',
    description: "City's main public library with over 50,000 books and e-resources.",
    longDescription: 'The Jamshedpur Public Library houses over 50,000 books, magazines, and newspapers, and offers free e-resource access. It runs reading and coding workshops every Saturday for students.',
    serviceTags: ['Books', 'E-Resources', 'Study Hall', 'Workshops', 'Free Entry'],
    address: 'Bistupur Cooperative Colony', area: 'Bistupur', pincode: '831001',
    phone: '+916572250100',
    lat: 22.8030, lng: 86.2010,
    isOpen: true, isVerified: true, isFeatured: false, plan: 'basic',
    rating: 4.6, reviewCount: 88,
    hours: {
      mon: { open: '9:00 AM', close: '7:00 PM' }, tue: { open: '9:00 AM', close: '7:00 PM' },
      wed: { open: '9:00 AM', close: '7:00 PM' }, thu: { open: '9:00 AM', close: '7:00 PM' },
      fri: { open: '9:00 AM', close: '7:00 PM' }, sat: { open: '9:00 AM', close: '5:00 PM' },
      sun: { isClosed: true },
    },
  },
  {
    name: 'HDFC Bank ATM',
    category: 'Banking & Finance', tag: 'bank',
    emoji: '💳', bgColor: '#e6f1fb',
    description: '24/7 ATM and banking services including locker facility and full-service branch.',
    longDescription: 'HDFC Bank Sakchi is a full-service branch offering savings and current accounts, personal loans, credit cards, and investment products. The 24/7 ATM lobby also has a cash deposit machine.',
    serviceTags: ['ATM', 'Credit Cards', 'Personal Loans', 'Investments', 'Lockers'],
    address: 'Sakchi Market Complex', area: 'Sakchi', pincode: '831001',
    phone: '+916572260000',
    lat: 22.7945, lng: 86.1860,
    isOpen: true, isVerified: true, isFeatured: false, plan: 'basic',
    rating: 4.0, reviewCount: 310,
    hours: {
      mon: { open: '9:30 AM', close: '4:30 PM' }, tue: { open: '9:30 AM', close: '4:30 PM' },
      wed: { open: '9:30 AM', close: '4:30 PM' }, thu: { open: '9:30 AM', close: '4:30 PM' },
      fri: { open: '9:30 AM', close: '4:30 PM' }, sat: { open: '9:30 AM', close: '2:00 PM' },
      sun: { isClosed: true },
    },
  },
  {
    name: 'Dimna Dhaba',
    category: 'Restaurant', tag: 'food',
    emoji: '🍛', bgColor: '#faeeda',
    description: 'Iconic roadside dhaba near Dimna Lake famous for dal-baati and litti chokha.',
    longDescription: 'Dimna Dhaba is a beloved roadside restaurant that has been serving traditional Jharkhand cuisine since 1978. Seated beside the picturesque Dimna Lake, it is the go-to spot for litti chokha, dal-baati, and fresh lassi. Perfect for weekend outings.',
    serviceTags: ['Litti Chokha', 'Dal-Baati', 'Lassi', 'Lake Views', 'Weekend Special'],
    address: 'Dimna Lake Road', area: 'Telco', pincode: '831004',
    phone: '+919123456789',
    lat: 22.7630, lng: 86.2300,
    isOpen: true, isVerified: false, isFeatured: false, plan: 'basic',
    rating: 4.7, reviewCount: 543,
    hours: {
      mon: { open: '11:00 AM', close: '9:00 PM' }, tue: { open: '11:00 AM', close: '9:00 PM' },
      wed: { open: '11:00 AM', close: '9:00 PM' }, thu: { open: '11:00 AM', close: '9:00 PM' },
      fri: { open: '11:00 AM', close: '10:00 PM' }, sat: { open: '9:00 AM', close: '10:00 PM' },
      sun: { open: '8:00 AM', close: '10:00 PM' },
    },
  },
];

const REVIEW_SEED = [
  // Tata Main Hospital
  { bizIndex: 0, authorName: 'Rahul Kumar', rating: 5, text: 'Excellent facilities and very professional staff. My father was admitted for cardiac surgery and the entire team from admission to discharge was extremely helpful and caring. Highly recommend.' },
  { bizIndex: 0, authorName: 'Priya Singh',  rating: 4, text: 'Good hospital with well-trained doctors. The emergency department is well-organized. Waiting time can be long during peak hours but overall experience was positive.' },
  { bizIndex: 0, authorName: 'Amit Mahato',  rating: 5, text: 'Best hospital in the city. The oncology department is world-class. The doctors are experienced and the nursing staff is very kind and attentive.' },
  // Hotel Kaveri
  { bizIndex: 1, authorName: 'Sunita Devi', rating: 5, text: 'Best thali in Jamshedpur! The food is fresh, hot and very generous in quantity. The staff is friendly too.' },
  { bizIndex: 1, authorName: 'Ravi Jha',    rating: 4, text: 'Good ambience for family dining. Chinese section is a bit average but the Indian main course is excellent.' },
  // DPS Jamshedpur
  { bizIndex: 3, authorName: 'Kavita Singh', rating: 5, text: 'My kids have been studying here for 5 years. Excellent teaching staff and wonderful infrastructure. Proud parent.' },
  // Apollo Clinic
  { bizIndex: 5, authorName: 'Mohan Das', rating: 5, text: 'Quick appointment, minimal waiting, very attentive doctor. The lab reports came the same day. Very satisfied.' },
  // Dimna Dhaba
  { bizIndex: 9, authorName: 'Anil Tiwari', rating: 5, text: 'Best litti chokha I have ever had. The lake view makes it magical. Perfect Sunday outing spot.' },
  { bizIndex: 9, authorName: 'Neha Roy',    rating: 5, text: 'Authentic Jharkhand food, affordable price, beautiful location. We come here every month. Never disappoints.' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('🗄️  Connected to MongoDB');

    // Wipe existing data
    await Business.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Cleared existing businesses and reviews');

    // Insert businesses
    const inserted = await Business.insertMany(BUSINESS_SEED);
    console.log(`✅ Seeded ${inserted.length} businesses`);

    // Insert reviews (skip review-triggered rating update since ratings are preset in seed)
    const reviewDocs = REVIEW_SEED.map(r => ({
      business:       inserted[r.bizIndex]._id,
      authorName:     r.authorName,
      authorInitials: r.authorName.split(' ').slice(0,2).map(w => w[0].toUpperCase()).join(''),
      authorColor:    ['#378add','#1d9e75','#ef9f27','#e24b4a','#8e4ec6'][Math.floor(Math.random()*5)],
      rating:         r.rating,
      text:           r.text,
    }));
    // Use insertMany directly to bypass the post-save hook (ratings already set in seed data)
    await Review.collection.insertMany(reviewDocs.map(d => ({ ...d, createdAt: new Date(), updatedAt: new Date() })));
    console.log(`✅ Seeded ${reviewDocs.length} reviews`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
