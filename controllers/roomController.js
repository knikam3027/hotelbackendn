const Room = require('../models/Room');
const Booking = require('../models/Booking');
const path = require('path');
const fs = require('fs');

// Add new room
const addRoom = async (req, res) => {
    try {
        const { roomType, roomPrice, roomDescription } = req.body;
        
        if (!roomType || !roomPrice || !roomDescription) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Room type, price, and description are required'
            });
        }

        let roomPhotoUrl = '';
        if (req.file) {
            // Use local file path as URL
            roomPhotoUrl = `/uploads/rooms/${req.file.filename}`;
        }

        const room = new Room({
            roomType,
            roomPrice: parseFloat(roomPrice),
            roomDescription,
            roomPhotoUrl
        });

        await room.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Room added successfully',
            room: room
        });
    } catch (error) {
        console.error('Add room error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to add room'
        });
    }
};

// Get all available rooms
const getAllAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        
        res.status(200).json({
            statusCode: 200,
            message: 'Rooms retrieved successfully',
            roomList: rooms
        });
    } catch (error) {
        console.error('Get all available rooms error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve rooms'
        });
    }
};

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        
        res.status(200).json({
            statusCode: 200,
            message: 'Rooms retrieved successfully',
            roomList: rooms
        });
    } catch (error) {
        console.error('Get all rooms error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve rooms'
        });
    }
};

// Get available rooms by date and type
const getAvailableRoomsByDateAndType = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, roomType } = req.query;
        
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Check-in and check-out dates are required'
            });
        }

        // Build query
        const roomQuery = {};
        if (roomType && roomType !== '' && roomType !== 'All') {
            roomQuery.roomType = roomType;
        }

        // Get all rooms matching type criteria
        const rooms = await Room.find(roomQuery);

        // Filter out rooms that are booked for the given date range
        const availableRooms = [];
        
        for (const room of rooms) {
            const conflictingBookings = await Booking.find({
                room: room._id,
                $or: [
                    {
                        checkInDate: { $lte: new Date(checkOutDate) },
                        checkOutDate: { $gte: new Date(checkInDate) }
                    }
                ]
            });

            if (conflictingBookings.length === 0) {
                availableRooms.push(room);
            }
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Available rooms retrieved successfully',
            roomList: availableRooms
        });
    } catch (error) {
        console.error('Get available rooms by date and type error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve available rooms'
        });
    }
};

// Get room types
const getRoomTypes = async (req, res) => {
    try {
        const roomTypes = await Room.distinct('roomType');
        
        res.status(200).json({
            statusCode: 200,
            message: 'Room types retrieved successfully',
            roomTypes: roomTypes
        });
    } catch (error) {
        console.error('Get room types error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve room types'
        });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'Room retrieved successfully',
            room: room
        });
    } catch (error) {
        console.error('Get room by ID error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve room'
        });
    }
};

// Update room
const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { roomType, roomPrice, roomDescription } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Room not found'
            });
        }

        // Update room fields
        room.roomType = roomType || room.roomType;
        room.roomPrice = roomPrice ? parseFloat(roomPrice) : room.roomPrice;
        room.roomDescription = roomDescription || room.roomDescription;

        // Handle photo update
        if (req.file) {
            // Delete old photo from local storage if it exists
            if (room.roomPhotoUrl && room.roomPhotoUrl.startsWith('/uploads')) {
                const oldFilePath = path.join(__dirname, '../', room.roomPhotoUrl);
                try {
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (error) {
                    console.log('Error deleting old image:', error);
                }
            }
            room.roomPhotoUrl = `/uploads/rooms/${req.file.filename}`;
        }

        await room.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Room updated successfully',
            room: room
        });
    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to update room'
        });
    }
};

// Delete room
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Room not found'
            });
        }

        // Delete room photo from local storage if it exists
        if (room.roomPhotoUrl && room.roomPhotoUrl.startsWith('/uploads')) {
            const photoPath = path.join(__dirname, '../', room.roomPhotoUrl);
            try {
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            } catch (error) {
                console.log('Error deleting image file:', error);
            }
        }

        // Delete all bookings associated with this room
        await Booking.deleteMany({ room: roomId });

        // Delete the room
        await Room.findByIdAndDelete(roomId);

        res.status(200).json({
            statusCode: 200,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to delete room'
        });
    }
};

module.exports = {
    addRoom,
    getAllAvailableRooms,
    getAllRooms,
    getAvailableRoomsByDateAndType,
    getRoomTypes,
    getRoomById,
    updateRoom,
    deleteRoom
};