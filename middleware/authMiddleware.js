const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = await User.findById(decoded.id).select('-password').populate('role');

            // Hardcode permissions for default admin if role is missing/broken
            if (req.user && req.user.email === 'admin@admin.com') {
                req.user.permissions = ['*'];
            }

            next();

        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// RBAC Middleware
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.user) {
            // Safely extract permissions with fallbacks
            let permissions = [];

            if (req.user.role && Array.isArray(req.user.role.permissions)) {
                permissions = req.user.role.permissions;
            } else if (Array.isArray(req.user.permissions)) {
                permissions = req.user.permissions;
            }

            console.log(`Checking permission: ${permission} against [${permissions}] for user ${req.user.email}`);

            if (permissions.includes(permission) || permissions.includes('*')) {
                next();
            } else {
                res.status(403);
                throw new Error(`Forbidden: Missing permission ${permission}. User has: [${permissions.join(', ')}]`);
            }
        } else {
            res.status(401);
            throw new Error('Not authorized, no user found');
        }
    };
};


module.exports = { protect, hasPermission };
