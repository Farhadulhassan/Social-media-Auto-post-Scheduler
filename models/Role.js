const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    permissions: [{ type: String }] // e.g. ["scheduler.view", "post.edit.caption"]
});

module.exports = mongoose.model('Role', roleSchema);
