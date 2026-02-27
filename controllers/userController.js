const User = require('../models/User');
const Booking = require('../models/Booking');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.status(200).json({
            statusCode: 200,
            message: 'Users retrieved successfully',
            userList: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve users'
        });
    }
};

// Get logged-in user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User not found'
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Profile retrieved successfully',
            user: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve profile'
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User not found'
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'User retrieved successfully',
            user: user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve user'
        });
    }
};

// Get user bookings by user ID
const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User not found'
            });
        }

        const bookings = await Booking.find({ user: userId })
            .populate('room')
            .populate('user', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            statusCode: 200,
            message: 'User bookings retrieved successfully',
            bookingList: bookings
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve user bookings'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User not found'
            });
        }

        // Delete all bookings associated with this user
        await Booking.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            statusCode: 200,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to delete user'
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phoneNumber, password } = req.body;

        // Check if the requesting user is updating their own profile or is an admin
        if (req.user._id.toString() !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                statusCode: 403,
                message: 'You can only update your own profile'
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        
        // Check if email is being changed and if it's unique
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    statusCode: 400,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        // Update password if provided
        if (password) {
            user.password = password; // Will be hashed by the pre-save hook
        }

        await user.save();

        res.status(200).json({
            statusCode: 200,
            message: 'User profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to update profile'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserProfile,
    getUserById,
    getUserBookings,
    updateUserProfile,
    deleteUser
};