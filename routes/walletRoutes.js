const express = require('express');
const { auth } = require('../middleware/auth');
const {
    getWallet,
    addMoney,
    spendMoney,
    getTransactions,
    refundMoney
} = require('../controllers/walletController');

const router = express.Router();

// Wallet routes (all protected)
router.get('/balance', auth, getWallet);
router.post('/add', auth, addMoney);
router.post('/spend', auth, spendMoney);
router.get('/transactions', auth, getTransactions);
router.post('/refund', auth, refundMoney);

module.exports = router;
