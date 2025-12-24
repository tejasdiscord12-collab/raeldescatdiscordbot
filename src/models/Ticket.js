const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'support', 'billing'
    closed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    transcript: { type: String, default: null } // Link to transcript if hosted, or text content
});

module.exports = mongoose.model('Ticket', ticketSchema);
