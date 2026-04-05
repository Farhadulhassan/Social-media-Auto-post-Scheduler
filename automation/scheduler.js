const { runLinkedInScheduler } = require('../schedulers/linkedin/linkedinScheduler');
const { runFacebookScheduler } = require('../schedulers/facebook/facebookScheduler');
const { runInstagramScheduler } = require('../schedulers/instagram/poster');

async function runAllSchedulers() {
    await runLinkedInScheduler();
    await runFacebookScheduler();
    await runInstagramScheduler();
}

runAllSchedulers();
