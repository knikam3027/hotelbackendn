const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    numOfAdults: {
        type: Number,
        required: [true, 'Number of adults is required'],
        min: 1
    },
    numOfChildren: {
        type: Number,
        default: 0,
        min: 0
    },
    totalNumOfGuests: {
        type: Number,
        required: false
    },
    bookingConfirmationCode: {
        type: String,
        required: false,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }
}, {
    timestamps: true
});

// Calculate total guests and generate confirmation code before saving
bookingSchema.pre('save', function(next) {
    this.totalNumOfGuests = this.numOfAdults + this.numOfChildren;
    
    // Generate confirmation code if not already set
    if (!this.bookingConfirmationCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.bookingConfirmationCode = code;
    }
    
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);