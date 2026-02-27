const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Register user
const register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, role } = req.body;

        // Validate input
        if (!name || !email || !phoneNumber || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                statusCode: 400,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phoneNumber,
            password,
            role: role || 'USER'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            statusCode: 200,
            message: 'User registered successfully',
            token,
            role: user.role,
            expirationTime: '24 Hours',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Registration failed'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            statusCode: 200,
            message: 'Login successful',
            token,
            role: user.role,
            expirationTime: '24 Hours',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Login failed'
        });
    }
};

module.exports = {
    register,
    login
};