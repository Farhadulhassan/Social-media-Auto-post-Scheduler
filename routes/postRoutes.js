const express = require('express');
const router = express.Router();
const {
    getPostsByScheduler,
    createPost,
    uploadCsvPosts,
    deletePost,
    clearAllPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Specific routes first


router.post('/:schedulerId/upload', protect, uploadCsvPosts);
router.delete('/:schedulerId/all', protect, clearAllPosts);

// Param routes second
router.route('/:schedulerId')
    .get(protect, getPostsByScheduler)
    .post(protect, createPost);

router.delete('/:id', protect, deletePost);


module.exports = router;
