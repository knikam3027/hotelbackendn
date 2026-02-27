const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const walletRoutes = require('./routes/walletRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:7070',
        'https://siddhihotel.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: 'Siddhi Hotel Backend API is running!',
        timestamp: new Date().toISOString()
    });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/wallet', walletRoutes);

// Global error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json({
        statusCode: error.status || 500,
        message: error.message || 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: 'Route not found'
    });
});

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/siddhihotel');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        // Don't exit the process, allow server to start without DB connection
        console.log('Server will continue without database connection...');
    }
};

const PORT = process.env.PORT || 4040;

// Start server first, then try to connect to database
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB(); // Connect to database after server starts
});

module.exports = app;