# Sakhi Seva - Setup Guide

## Current Status
✅ **Authentication System**: JWT-based authentication with fallback mode (works without MongoDB)
✅ **Training Page**: Video module structure with dummy content
✅ **UI Components**: Modern, responsive design with Sakhi Seva theme

## Features Implemented

### Authentication
- **Signup**: Full name, email, age, phone number, password
- **Login**: Email and password authentication
- **JWT Tokens**: Secure authentication with HTTP-only cookies
- **Profile Dropdown**: Shows when user is logged in
- **Fallback Mode**: Works without MongoDB for demo purposes

### Training Page
- **Video Modules**: Organized training content
- **Progress Tracking**: Local storage for completion status
- **Search Functionality**: Find topics quickly
- **Responsive Design**: Works on all devices

## How to Use

### Without MongoDB (Demo Mode)
1. The app works out of the box in demo mode
2. Sign up with any email/password combination
3. Login will work with any credentials
4. All data is stored in JWT tokens (temporary)

### With MongoDB (Production Mode)
1. Install MongoDB locally or use MongoDB Atlas
2. Create a `.env.local` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/sakhi-seva
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```
3. The app will automatically detect MongoDB and use it

## Testing the Signup
You can now test the signup with:
- **Email**: yadneshmore2355@gmail.com
- **Password**: 123456
- **Full Name**: Your Name
- **Age**: 25
- **Phone**: +1234567890

The system will work in demo mode and create a temporary user session.

## Training Page Features
- Browse through 3 modules: Digital Literacy, Digital Payments, E-commerce
- Watch embedded YouTube videos
- Mark topics as complete
- Track overall progress
- Search through topics

## Next Steps
1. Install MongoDB for persistent data storage
2. Add more training content
3. Implement user profiles
4. Add marketplace functionality
5. Add schemes/resource pages

