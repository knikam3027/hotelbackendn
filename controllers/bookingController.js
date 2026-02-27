const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

// Book a room
const bookRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        const { checkInDate, checkOutDate, numOfAdults, numOfChildren } = req.body;

        // Validate input
        if (!checkInDate || !checkOutDate || !numOfAdults) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Check-in date, check-out date, and number of adults are required'
            });
        }

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Room not found'
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

        // Check if room is available for the given dates
        const conflictingBookings = await Booking.find({
            room: roomId,
            $or: [
                {
                    checkInDate: { $lte: new Date(checkOutDate) },
                    checkOutDate: { $gte: new Date(checkInDate) }
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Room is not available for the selected dates'
            });
        }

        // Create booking
        const booking = new Booking({
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            numOfAdults: parseInt(numOfAdults),
            numOfChildren: parseInt(numOfChildren) || 0,
            room: roomId,
            user: userId
        });

        await booking.save();

        // Populate booking with room and user details
        await booking.populate('room');
        await booking.populate('user', 'name email phoneNumber');

        res.status(200).json({
            statusCode: 200,
            message: 'Room booked successfully',
            booking: booking
        });
    } catch (error) {
        console.error('Book room error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to book room'
        });
    }
};

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('room')
            .populate('user', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            statusCode: 200,
            message: 'Bookings retrieved successfully',
            bookingList: bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve bookings'
        });
    }
};

// Get booking by confirmation code
const getBookingByConfirmationCode = async (req, res) => {
    try {
        const { confirmationCode } = req.params;

        const booking = await Booking.findOne({ 
            bookingConfirmationCode: confirmationCode 
        })
            .populate('room')
            .populate('user', 'name email phoneNumber');

        if (!booking) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Booking not found with this confirmation code'
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Booking retrieved successfully',
            booking: booking
        });
    } catch (error) {
        console.error('Get booking by confirmation code error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve booking'
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Booking not found'
            });
        }

        // Check if the user can cancel this booking
        if (req.user.role !== 'ADMIN' && booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                statusCode: 403,
                message: 'You can only cancel your own bookings'
            });
        }

        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({
            statusCode: 200,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to cancel booking'
        });
    }
};

module.exports = {
    bookRoom,
    getAllBookings,
    getBookingByConfirmationCode,
    cancelBooking
};