const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    prize: { type: String, required: true },
    winnerCount: { type: Number, default: 1 },
    endAt: { type: Date, required: true },
    ended: { type: Boolean, default: false },
    winners: { type: [String], default: [] }, // Array of user IDs
    hostedBy: { type: String, required: true }
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
