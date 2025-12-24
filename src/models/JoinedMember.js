const mongoose = require('mongoose');

const joinedMemberSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    inviterId: { type: String, required: true },
    joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JoinedMember', joinedMemberSchema);
