const express = require('express');
const router = express.Router();
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getAvailablePermissions
} = require('../controllers/roleController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// All routes require authentication and admin.roles permission
router.get('/permissions', protect, hasPermission('admin.roles'), getAvailablePermissions);
router.get('/', protect, hasPermission('admin.roles'), getRoles);
router.post('/', protect, hasPermission('admin.roles'), createRole);
router.put('/:id', protect, hasPermission('admin.roles'), updateRole);
router.delete('/:id', protect, hasPermission('admin.roles'), deleteRole);

module.exports = router;
