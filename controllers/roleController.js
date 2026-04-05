const asyncHandler = require('express-async-handler');
const Role = require('../models/Role');
const User = require('../models/User');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find({});

    // Get user count for each role
    const rolesWithUserCount = await Promise.all(
        roles.map(async (role) => {
            const userCount = await User.countDocuments({ role: role._id });
            return {
                ...role.toObject(),
                userCount
            };
        })
    );

    res.json(rolesWithUserCount);
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = asyncHandler(async (req, res) => {
    const { name, permissions } = req.body;

    if (!name || !permissions) {
        res.status(400);
        throw new Error('Please provide role name and permissions');
    }

    // Check if role already exists
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
        res.status(400);
        throw new Error('Role already exists');
    }

    const role = await Role.create({
        name,
        permissions
    });

    res.status(201).json(role);
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
const updateRole = asyncHandler(async (req, res) => {
    const { name, permissions } = req.body;
    const role = await Role.findById(req.params.id);

    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    // Prevent updating super admin role
    if (role.name === 'Super Admin') {
        res.status(403);
        throw new Error('Cannot modify Super Admin role');
    }

    role.name = name || role.name;
    role.permissions = permissions || role.permissions;

    const updatedRole = await role.save();
    res.json(updatedRole);
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
const deleteRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    // Prevent deleting super admin role
    if (role.name === 'Super Admin') {
        res.status(403);
        throw new Error('Cannot delete Super Admin role');
    }

    // Check if any users have this role
    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) {
        res.status(400);
        throw new Error(`Cannot delete role. ${usersWithRole} user(s) are assigned to this role`);
    }

    await Role.deleteOne({ _id: req.params.id });
    res.json({ message: 'Role deleted successfully' });
});

// @desc    Get available permissions
// @route   GET /api/roles/permissions
// @access  Private/Admin
const getAvailablePermissions = asyncHandler(async (req, res) => {
    const permissions = [
        { id: '*', name: 'Super Admin', description: 'Full access to all features' },
        { id: 'scheduler.view', name: 'View Schedulers', description: 'Can view schedulers' },
        { id: 'scheduler.create', name: 'Create Schedulers', description: 'Can create new schedulers' },
        { id: 'scheduler.edit', name: 'Edit Schedulers', description: 'Can edit existing schedulers' },
        { id: 'scheduler.delete', name: 'Delete Schedulers', description: 'Can delete schedulers' },
        { id: 'post.view', name: 'View Posts', description: 'Can view posts' },
        { id: 'post.create', name: 'Create Posts', description: 'Can create new posts' },
        { id: 'post.edit', name: 'Edit Posts', description: 'Can edit existing posts' },
        { id: 'post.delete', name: 'Delete Posts', description: 'Can delete posts' },
        { id: 'admin.users', name: 'Manage Users', description: 'Can manage user accounts' },
        { id: 'admin.roles', name: 'Manage Roles', description: 'Can manage roles and permissions' }
    ];

    res.json(permissions);
});

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getAvailablePermissions
};
