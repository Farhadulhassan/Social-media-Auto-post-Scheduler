const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).populate('role').select('-password');
    res.json(users);
});

// @desc    Update user status (Approve/Block)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(`[UserMgmt] Request to update status for: ${id}`);

    const user = await User.findById(id);

    if (!user) {
        console.error(`[UserMgmt] User not found: ${id}`);
        res.status(404);
        throw new Error('User not found');
    }

    const oldStatus = user.status;

    if (req.body?.status) {
        user.status = req.body.status;
    } else {
        // Toggle logic
        user.status = (user.status === 'APPROVED') ? 'BLOCKED' : 'APPROVED';
    }

    if (req.body?.roleId) {
        user.role = req.body.roleId;
    }

    if (req.body?.assignedSchedulers) {
        user.assignedSchedulers = req.body.assignedSchedulers;
    }



    try {
        await user.save();

        // Fetch fresh populated user
        const updatedUser = await User.findById(user._id)
            .populate('role')
            .select('-password')
            .lean();

        if (!updatedUser) {
            throw new Error('Failed to synchronize user state after save');
        }

        console.log(`[UserMgmt] SUCCESS: ${updatedUser.email} ${oldStatus} -> ${updatedUser.status}`);
        res.json(updatedUser);
    } catch (error) {
        console.error(`[UserMgmt] CRITICAL ERROR during update:`, error.message);
        res.status(400);
        throw error;  // Let asyncHandler handle it
    }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            status: updatedUser.status,
            token: req.headers.authorization.split(' ')[1]
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/user-management/admin/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.email === 'admin@admin.com') {
        res.status(400);
        throw new Error('Cannot delete super admin');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

module.exports = {
    getUsers,
    updateUserStatus,
    updateUserProfile,
    deleteUser
};

