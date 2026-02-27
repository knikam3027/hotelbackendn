const Wallet = require('../models/Wallet');
const User = require('../models/User');

// Get or create wallet for user
const getOrCreateWallet = async (userId) => {
    try {
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = new Wallet({ user: userId, balance: 0 });
            await wallet.save();
        }
        return wallet;
    } catch (error) {
        throw error;
    }
};

// Get wallet balance
const getWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await getOrCreateWallet(userId);

        res.status(200).json({
            statusCode: 200,
            message: 'Wallet retrieved successfully',
            wallet: wallet
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve wallet'
        });
    }
};

// Add money to wallet
const addMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount, paymentMethod } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Amount must be greater than 0'
            });
        }

        const wallet = await getOrCreateWallet(userId);

        // Add transaction
        wallet.transactions.push({
            type: 'ADD',
            amount: amount,
            description: `Money added via ${paymentMethod || 'Payment'}`,
            timestamp: new Date()
        });

        wallet.balance += amount;
        wallet.totalAdded += amount;
        wallet.updatedAt = new Date();
        await wallet.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Money added successfully',
            wallet: wallet
        });
    } catch (error) {
        console.error('Add money error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to add money'
        });
    }
};

// Spend from wallet (for booking)
const spendMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount, bookingId, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Amount must be greater than 0'
            });
        }

        const wallet = await getOrCreateWallet(userId);

        if (wallet.balance < amount) {
            return res.status(400).json({
                statusCode: 400,
                message: `Insufficient wallet balance. Current: ₹${wallet.balance}, Required: ₹${amount}`
            });
        }

        // Deduct from wallet
        wallet.transactions.push({
            type: 'SPEND',
            amount: amount,
            description: description || 'Booking payment',
            bookingId: bookingId,
            timestamp: new Date()
        });

        wallet.balance -= amount;
        wallet.totalSpent += amount;
        wallet.updatedAt = new Date();
        await wallet.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Payment successful',
            wallet: wallet
        });
    } catch (error) {
        console.error('Spend money error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to process payment'
        });
    }
};

// Get transaction history
const getTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await getOrCreateWallet(userId);

        const transactions = wallet.transactions.sort((a, b) => b.timestamp - a.timestamp);

        res.status(200).json({
            statusCode: 200,
            message: 'Transactions retrieved successfully',
            transactions: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to retrieve transactions'
        });
    }
};

// Refund to wallet
const refundMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount, bookingId, reason } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Refund amount must be greater than 0'
            });
        }

        const wallet = await getOrCreateWallet(userId);

        wallet.transactions.push({
            type: 'REFUND',
            amount: amount,
            description: reason || 'Refund',
            bookingId: bookingId,
            timestamp: new Date()
        });

        wallet.balance += amount;
        wallet.updatedAt = new Date();
        await wallet.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Refund processed successfully',
            wallet: wallet
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            statusCode: 500,
            message: error.message || 'Failed to process refund'
        });
    }
};

module.exports = {
    getWallet,
    addMoney,
    spendMoney,
    getTransactions,
    refundMoney,
    getOrCreateWallet
};
