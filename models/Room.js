const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        trim: true
    },
    roomPrice: {
        type: Number,
        required: [true, 'Room price is required'],
        min: 0
    },
    roomPhotoUrl: {
        type: String,
        default: ''
    },
    roomDescription: {
        type: String,
        required: [true, 'Room description is required'],
        trim: true
    }
}, {
    timestamps: true
});

// Virtual for bookings
roomSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'room'
});

// Ensure virtual fields are serialized
roomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);