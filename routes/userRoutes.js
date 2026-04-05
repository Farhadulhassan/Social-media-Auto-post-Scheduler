const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserStatus,
    updateUserProfile,
    deleteUser
} = require('../controllers/userController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Admin routes
router.get('/admin/list', protect, hasPermission('*'), getUsers);
router.patch('/admin/:id/status', protect, hasPermission('*'), updateUserStatus);
router.delete('/admin/:id', protect, hasPermission('*'), deleteUser);


// Profile routes
router.put('/profile', protect, updateUserProfile);

module.exports = router;
