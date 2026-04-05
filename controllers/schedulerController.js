const asyncHandler = require('express-async-handler');
const Scheduler = require('../models/Scheduler');

// @desc    Get all schedulers
// @route   GET /api/schedulers
// @access  Private
const getSchedulers = asyncHandler(async (req, res) => {
    let query = {};

    // Extract permissions safely (same logic as authMiddleware)
    let permissions = [];
    if (req.user.role && Array.isArray(req.user.role.permissions)) {
        permissions = req.user.role.permissions;
    } else if (Array.isArray(req.user.permissions)) {
        permissions = req.user.permissions;
    }

    // If not super admin, only show assigned or owned schedulers
    if (!permissions.includes('*')) {
        query = { _id: { $in: req.user.assignedSchedulers || [] } };
    }

    const schedulers = await Scheduler.find(query).populate('owner', 'name email');
    res.json(schedulers);
});


// @desc    Create a scheduler
// @route   POST /api/schedulers
// @access  Private/Admin
const createScheduler = asyncHandler(async (req, res) => {
    const { name, platform, platformId, accessToken } = req.body;

    const scheduler = await Scheduler.create({
        name,
        platform,
        platformId,
        accessToken,
        owner: req.user._id
    });

    res.status(201).json(scheduler);
});

// @desc    Update scheduler status
// @route   PATCH /api/schedulers/:id/status
// @access  Private
const updateSchedulerStatus = asyncHandler(async (req, res) => {
    const scheduler = await Scheduler.findById(req.params.id);

    if (!scheduler) {
        res.status(404);
        throw new Error('Scheduler not found');
    }

    scheduler.status = scheduler.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await scheduler.save();

    res.json(scheduler);
});

// @desc    Update scheduler
// @route   PUT /api/schedulers/:id
// @access  Private
const updateScheduler = asyncHandler(async (req, res) => {
    const scheduler = await Scheduler.findById(req.params.id);

    if (!scheduler) {
        res.status(404);
        throw new Error('Scheduler not found');
    }

    scheduler.name = req.body.name || scheduler.name;
    scheduler.platform = req.body.platform || scheduler.platform;
    scheduler.platformId = req.body.platformId || scheduler.platformId;
    if (req.body.accessToken) {
        scheduler.accessToken = req.body.accessToken;
    }

    const updatedScheduler = await scheduler.save();
    const populated = await updatedScheduler.populate('owner', 'name email');
    res.json(populated);
});


// @desc    Delete scheduler
// @route   DELETE /api/schedulers/:id
// @access  Private
const deleteScheduler = asyncHandler(async (req, res) => {
    const scheduler = await Scheduler.findById(req.params.id);

    if (!scheduler) {
        res.status(404);
        throw new Error('Scheduler not found');
    }

    await scheduler.deleteOne();
    res.json({ message: 'Scheduler removed' });
});

module.exports = {
    getSchedulers,
    createScheduler,
    updateSchedulerStatus,
    updateScheduler,
    deleteScheduler
};

