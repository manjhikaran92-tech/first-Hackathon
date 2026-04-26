# CityFind Backend API

Backend API for CityFind Jamshedpur - A comprehensive city directory service for local businesses and services.

## Features

- 🏢 **Business Management**: Complete CRUD operations for business listings
- 👤 **User Authentication**: Secure JWT-based authentication with role-based access
- ⭐ **Review System**: User reviews and ratings with image support
- 🔍 **Advanced Search**: Full-text search with filtering and sorting
- 📁 **File Uploads**: Image uploads for businesses and reviews
- 📊 **Analytics**: Business and user statistics
- 🛡️ **Security**: Rate limiting, input validation, and secure headers

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd city-service/backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB (make sure it's running on your system)

5. Seed the database (optional)
```bash
npm run seed
```

6. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "9876543210",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Business Endpoints

#### Get All Businesses
```http
GET /businesses?page=1&limit=20&category=food&area=Bistupur&search=hospital&rating=4&verified=true&featured=true&sort=rating&order=desc
```

#### Get Business by ID
```http
GET /businesses/:id
```

#### Create Business
```http
POST /businesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Business Name",
  "description": "Business description",
  "category": "food",
  "area": "Bistupur",
  "address": "123 Main Street",
  "phone": "9876543210",
  "email": "business@example.com",
  "website": "https://business.com"
}
```

#### Update Business
```http
PUT /businesses/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Business
```http
DELETE /businesses/:id
Authorization: Bearer <token>
```

#### Get Featured Businesses
```http
GET /businesses/featured
```

#### Search Businesses
```http
GET /businesses/search/:query?page=1&limit=20
```

### Review Endpoints

#### Get Business Reviews
```http
GET /reviews/business/:businessId?page=1&limit=10&sort=createdAt&order=desc
```

#### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "business": "businessId",
  "rating": 5,
  "title": "Great Experience",
  "comment": "Amazing service and quality!"
}
```

#### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <token>
```

#### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Category Endpoints

#### Get All Categories
```http
GET /categories
```

#### Get Category by Slug
```http
GET /categories/:slug
```

### User Endpoints

#### Get User Favorites
```http
GET /users/favorites/my-favorites
Authorization: Bearer <token>
```

#### Add/Remove Favorite
```http
POST /users/favorites/:businessId
Authorization: Bearer <token>
```

## Database Schema

### Business Model
```javascript
{
  name: String,
  description: String,
  category: String,
  area: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  coordinates: { lat: Number, lng: Number },
  images: [{ url: String, filename: String, isPrimary: Boolean }],
  owner: ObjectId,
  verified: Boolean,
  featured: Boolean,
  status: String,
  operatingHours: Object,
  services: [String],
  amenities: [String],
  rating: { average: Number, count: Number },
  reviewCount: Number,
  viewCount: Number
}
```

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  avatar: { url: String, filename: String },
  businesses: [ObjectId],
  favorites: [ObjectId],
  reviews: [ObjectId],
  isVerified: Boolean,
  isActive: Boolean
}
```

### Review Model
```javascript
{
  business: ObjectId,
  user: ObjectId,
  rating: Number,
  title: String,
  comment: String,
  images: [{ url: String, filename: String }],
  helpful: Number,
  notHelpful: Number,
  response: { text: String, author: ObjectId, createdAt: Date },
  status: String
}
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cityfind
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- File upload restrictions

## Development

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

### Project Structure
```
backend/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── seeders/         # Database seeders
├── uploads/         # File upload directory
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
└── .env            # Environment variables
```

## License

MIT License
