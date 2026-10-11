
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        const token = req.cookies?.token ||
            (authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null);

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: token missing'
            });
        }
        const isBlackListed = await userModel.findOne({token: token});
        if (isBlackListed) {
            return res.status(401).json({
                message: 'Unauthorized: token is blacklisted'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
};