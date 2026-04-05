const express = require('express');
const router = express.Router();
const {
    getSchedulers,
    createScheduler,
    updateSchedulerStatus,
    updateScheduler,
    deleteScheduler
} = require('../controllers/schedulerController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, hasPermission('scheduler.view'), getSchedulers)
    .post(protect, hasPermission('scheduler.create'), createScheduler);

router.route('/:id')
    .put(protect, hasPermission('scheduler.edit'), updateScheduler)
    .delete(protect, hasPermission('*'), deleteScheduler);

router.patch('/:id/status', protect, hasPermission('scheduler.enable_disable'), updateSchedulerStatus);


module.exports = router;
