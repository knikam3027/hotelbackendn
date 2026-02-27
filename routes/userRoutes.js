const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
    getAllUsers,
    getUserProfile,
    getUserById,
    getUserBookings,
    updateUserProfile,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.get('/all', adminAuth, getAllUsers);
router.get('/get-logged-in-profile-info', auth, getUserProfile);
router.get('/get-by-id/:userId', auth, getUserById);
router.get('/get-user-bookings/:userId', auth, getUserBookings);
router.put('/update-profile/:userId', auth, updateUserProfile);
router.delete('/delete/:userId', adminAuth, deleteUser);

module.exports = router;