const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            statusCode: 401,
            message: 'Invalid token.'
        });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    statusCode: 403,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({
            statusCode: 401,
            message: 'Authentication failed.'
        });
    }
};

module.exports = { auth, adminAuth };