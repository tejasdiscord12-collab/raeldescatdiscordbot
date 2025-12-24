const mongoose = require('mongoose');

// This schema tracks the 'real' invites for a user
const inviteSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true }, // The inviter
    invites: { type: Number, default: 0 },
    regular: { type: Number, default: 0 },
    fake: { type: Number, default: 0 }, // Left users
    bonus: { type: Number, default: 0 }
});

module.exports = mongoose.model('Invite', inviteSchema);
