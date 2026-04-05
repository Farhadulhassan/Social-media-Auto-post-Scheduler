const mongoose = require('mongoose');
const Post = require('../models/Post');
const Scheduler = require('../models/Scheduler');
require('dotenv').config();

// Import platform posters
const { runLinkedInScheduler } = require('../schedulers/linkedin/linkedinScheduler');
const { runFacebookScheduler } = require('../schedulers/facebook/facebookScheduler');
const { runInstagramScheduler } = require('../schedulers/instagram/poster');

// For now, we'll keep the posters as they are but we need a bridge
// Long term: Refactor posters to accept a Post object directly

let isProcessing = false;

async function checkAndPost() {
    if (isProcessing) {
        console.log('[MongoScheduler] Previous run still in progress. Skipping...');
        return;
    }
    isProcessing = true;

    try {
        console.log('[MongoScheduler] Polling for pending posts...');
        const now = new Date();

        // Find all pending posts across all schedulers
        const pendingPosts = await Post.find({
            status: 'Pending'
        }).populate('schedulerId');

        for (const post of pendingPosts) {
            if (!post.schedulerId) {
                console.warn(`[MongoScheduler] Skipping post ${post._id} - missing schedulerId (possibly deleted)`);
                continue;
            }
            const scheduledTime = new Date(`${post.date} ${post.time}`);


            if (scheduledTime <= now) {
                console.log(`[MongoScheduler] Processing post: ${post.title} for ${post.schedulerId.platform}`);

                // For now, since the legacy schedulers read from CSV, 
                // we'll implement a temporary bridge or refactor the posters.
                // REFACTOR: Let's create a "universal_poster.js" or adapt them.

                // For this migration, I'll implement logic that calls the core 
                // posting functions using the data from the 'post' object.
                await processUnifiedPost(post);
            }
        }
    } catch (error) {
        console.error('[MongoScheduler] Error:', error.message);
    } finally {
        isProcessing = false;
    }
}

async function processUnifiedPost(post) {
    const platform = post.schedulerId.platform;
    let result;

    try {
        if (platform === 'Facebook') {
            const { processFBPost } = require('../schedulers/facebook/facebookScheduler');
            // Adapt post object to match the 'record' format expected by legacy code
            const record = {
                'Post Title': post.title,
                'Post Caption': post.caption,
                'Hashtags': post.hashtags,
                'Image Path OR Image URL': post.mediaPath,
                'Media Type': post.mediaType
            };
            result = await processFBPost(record);
        } else if (platform === 'LinkedIn') {
            const { processPost: processLIPost } = require('../schedulers/linkedin/linkedinScheduler');
            const record = {
                'Post Title': post.title,
                'Post Caption': post.caption,
                'Hashtags': post.hashtags,
                'Image Path OR Image URL': post.mediaPath,
                'Media Type': post.mediaType,
                'Date': post.date,
                'Time': post.time
            };
            result = await processLIPost(record);
        } else if (platform === 'Instagram') {
            // Need to extract logic from runInstagramScheduler
            result = await processInstagramPostManually(post);
        }

        if (result && result.success) {
            post.status = 'Posted';
            post.postedId = result.message.split('ID: ')[1] || 'SUCCESS';
            post.errorLog = result.message;
        } else if (result) {
            post.status = 'Failed';
            post.errorLog = result.message;
            post.retryCount += 1;
        }

        await post.save();
        console.log(`[MongoScheduler] Post ${post.status}: ${post.title}`);

    } catch (err) {
        console.error(`[MongoScheduler] Failed to process ${post.title}:`, err.message);
        post.status = 'Failed';
        post.errorLog = err.message;
        await post.save();
    }
}

async function processInstagramPostManually(post) {
    const { createImageContainer } = require('../schedulers/instagram/image.js');
    const { createVideoContainer } = require('../schedulers/instagram/video.js');
    const axios = require('axios');

    // Internal helper from instagram/poster.js
    async function publishMedia(accessToken, instagramId, creationId) {
        const response = await axios.post(`https://graph.facebook.com/v18.0/${instagramId}/media_publish`, null, {
            params: { creation_id: creationId, access_token: accessToken }
        });
        return response.data.id;
    }

    async function waitForMediaProcessing(accessToken, creationId) {
        const maxRetries = 20;
        const delay = 5000; // 5 seconds

        for (let i = 0; i < maxRetries; i++) {
            const response = await axios.get(`https://graph.facebook.com/v18.0/${creationId}`, {
                params: {
                    fields: 'status_code',
                    access_token: accessToken
                }
            });

            const status = response.data.status_code;
            if (status === 'FINISHED') {
                return;
            } else if (status === 'ERROR') {
                throw new Error('Instagram Media processing failed.');
            }

            console.log(`[Instagram] Media status: ${status}. Waiting... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        throw new Error('Instagram Media processing timed out.');
    }

    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    const instagramId = process.env.INSTAGRAM_BUSINESS_ID;
    const caption = `${post.title}\n\n${post.caption}\n\n${post.hashtags || ''}`;

    let creationId;
    if (post.mediaType === 'video') {
        // createVideoContainer inside video.js already has some wait logic, 
        // but we'll double check or rely on our new robust waiter for consistency if needed.
        // Actually, createVideoContainer calls waitForVideoProcessing internally. 
        // Let's assume it returns a READY container.
        creationId = await createVideoContainer(accessToken, instagramId, post.mediaPath, caption);
    } else {
        creationId = await createImageContainer(accessToken, instagramId, post.mediaPath, caption);
        // Images might also need a moment if fetched from URL
        await waitForMediaProcessing(accessToken, creationId);
    }

    // Double check status before publishing to be absolutely sure
    // await waitForMediaProcessing(accessToken, creationId); 

    const postId = await publishMedia(accessToken, instagramId, creationId);
    return { success: true, message: `Successfully posted. ID: ${postId}` };
}

module.exports = { checkAndPost };
