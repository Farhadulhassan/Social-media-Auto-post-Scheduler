const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync');

const fs = require('fs');
const path = require('path');

// @desc    Get all posts for a scheduler
// @route   GET /api/posts/:schedulerId
// @access  Private
const getPostsByScheduler = asyncHandler(async (req, res) => {
    const { schedulerId } = req.params;
    console.log(`[PostCtrl] Fetching posts for Scheduler: ${schedulerId}`);

    if (!mongoose.Types.ObjectId.isValid(schedulerId)) {
        console.error(`[PostCtrl] Invalid Scheduler ID: ${schedulerId}`);
        res.status(400);
        throw new Error('Invalid Scheduler ID');
    }

    try {
        const posts = await Post.find({ schedulerId });

        // Manual sort because dates are stored as MM/DD/YYYY strings
        const sortedPosts = posts.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        console.log(`[PostCtrl] Found ${sortedPosts.length} posts`);
        res.json(sortedPosts);
    } catch (error) {
        console.error(`[PostCtrl] Fetch failed:`, error.message);
        res.status(500);
        throw new Error('Failed to fetch posts: ' + error.message);
    }
});


// @desc    Create a single post manually
// @route   POST /api/posts/:schedulerId
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { date, time, topic, title, caption, hashtags, mediaPath, mediaType } = req.body;

    const post = await Post.create({
        schedulerId: req.params.schedulerId,
        date,
        time,
        topic,
        title,
        caption,
        hashtags,
        mediaPath,
        mediaType,
        status: 'Pending'
    });

    res.status(201).json(post);
});

// @desc    Bulk upload posts via CSV
// @route   POST /api/posts/:schedulerId/upload
// @access  Private
const uploadCsvPosts = asyncHandler(async (req, res) => {
    console.log(`[Upload] Received CSV for Scheduler: ${req.params.schedulerId}`);
    if (!req.files || !req.files.csvFile) {
        res.status(400);
        throw new Error('Please upload a CSV file');
    }

    const file = req.files.csvFile;
    const content = file.data.toString();

    try {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true
        });

        const postsToCreate = records.map(record => ({
            schedulerId: req.params.schedulerId,
            date: record.date || record.Date,
            time: record.time || record.Time,
            topic: record.topic || record.Topic || record['Topic Category'],
            title: record.title || record.Title || record['Post Title'],
            caption: record.caption || record.Caption || record['Post Caption'],
            hashtags: record.hashtags || record.Hashtags,
            mediaPath: record.mediaPath || record.MediaPath || record.media_path || record['Image Path OR Image URL'],
            mediaType: (record.mediaType || record.MediaType || record['Media Type'] || 'image').toLowerCase(),
            status: record['Post Status'] || record.status || 'Pending'
        }));



        const createdPosts = await Post.insertMany(postsToCreate);
        console.log(`[Upload] Successfully created ${createdPosts.length} posts`);
        res.status(201).json(createdPosts);
    } catch (error) {
        console.error('[Upload] Error:', error.message);
        res.status(400);
        throw new Error('Error parsing CSV: ' + error.message);
    }
});


// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    await post.deleteOne();
    res.json({ message: 'Post removed' });
});

// @desc    Delete all posts for a scheduler
// @route   DELETE /api/posts/:schedulerId/all
// @access  Private
const clearAllPosts = asyncHandler(async (req, res) => {
    const { schedulerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schedulerId)) {
        res.status(400);
        throw new Error('Invalid Scheduler ID');
    }

    const result = await Post.deleteMany({ schedulerId });
    console.log(`[PostCtrl] Cleared ${result.deletedCount} posts for scheduler ${schedulerId}`);

    res.json({ message: `Successfully cleared ${result.deletedCount} posts` });
});

module.exports = {
    getPostsByScheduler,
    createPost,
    uploadCsvPosts,
    deletePost,
    clearAllPosts
};

