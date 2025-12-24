const mongoose = require('mongoose');

const toxicWordSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    word: { type: String, required: true }
});

module.exports = mongoose.model('ToxicWord', toxicWordSchema);
