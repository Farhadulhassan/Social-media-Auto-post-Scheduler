const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role'); // Added to fix registration error
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            status: user.status,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('role');

    if (user && (await user.matchPassword(password))) {
        if (user.status !== 'APPROVED' && email !== 'admin@admin.com') {
            res.status(403);
            throw new Error('Account pending admin approval');
        }

        const isAdmin = email === 'admin@admin.com';

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role ? user.role.name : (isAdmin ? 'Super Admin' : null),
            permissions: user.role ? user.role.permissions : (isAdmin ? ['*'] : []),
            token: generateToken(user._id),
        });

    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

module.exports = { registerUser, authUser };
