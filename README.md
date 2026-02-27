# Siddhi Hotel Backend

A Node.js/Express.js backend API for hotel management system with MongoDB database.

## Features

- User registration and authentication with JWT
- Room management (CRUD operations)
- Booking management
- File upload for room images
- Role-based access control (USER/ADMIN)
- MongoDB with Mongoose ODM

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user

### Users
- GET `/users/all` - Get all users (Admin only)
- GET `/users/get-logged-in-profile-info` - Get current user profile
- GET `/users/get-by-id/:userId` - Get user by ID
- GET `/users/get-user-bookings/:userId` - Get user bookings
- DELETE `/users/delete/:userId` - Delete user (Admin only)

### Rooms
- POST `/rooms/add` - Add new room (Admin only)
- GET `/rooms/all-available-rooms` - Get all available rooms
- GET `/rooms/all` - Get all rooms
- GET `/rooms/available-rooms-by-date-and-type` - Get available rooms by date and type
- GET `/rooms/types` - Get room types
- GET `/rooms/room-by-id/:roomId` - Get room by ID
- PUT `/rooms/update/:roomId` - Update room (Admin only)
- DELETE `/rooms/delete/:roomId` - Delete room (Admin only)

### Bookings
- POST `/bookings/book-room/:roomId/:userId` - Book a room
- GET `/bookings/all` - Get all bookings (Admin only)
- GET `/bookings/get-by-confirmation-code/:confirmationCode` - Get booking by confirmation code
- DELETE `/bookings/cancel/:bookingId` - Cancel booking

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=4040
MONGODB_URI=mongodb://localhost:27017/siddhihotel
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Usage

The server runs on port 4040 by default. Make sure MongoDB is running on your system.

## Directory Structure

```
├── controllers/      # Business logic
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # File upload directory
├── server.js        # Main server file
├── package.json
└── .env
```