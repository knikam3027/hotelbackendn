const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
    bookRoom,
    getAllBookings,
    getBookingByConfirmationCode,
    cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/book-room/:roomId/:userId', auth, bookRoom);
router.get('/all', adminAuth, getAllBookings);
router.get('/get-by-confirmation-code/:confirmationCode', getBookingByConfirmationCode);
router.delete('/cancel/:bookingId', auth, cancelBooking);

module.exports = router;