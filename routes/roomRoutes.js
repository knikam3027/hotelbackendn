const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    addRoom,
    getAllAvailableRooms,
    getAllRooms,
    getAvailableRoomsByDateAndType,
    getRoomTypes,
    getRoomById,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');

const router = express.Router();

router.post('/add', adminAuth, upload.single('photo'), addRoom);
router.get('/all-available-rooms', getAllAvailableRooms);
router.get('/all', getAllRooms);
router.get('/available-rooms-by-date-and-type', getAvailableRoomsByDateAndType);
router.get('/types', getRoomTypes);
router.get('/room-by-id/:roomId', getRoomById);
router.put('/update/:roomId', adminAuth, upload.single('photo'), updateRoom);
router.delete('/delete/:roomId', adminAuth, deleteRoom);

module.exports = router;