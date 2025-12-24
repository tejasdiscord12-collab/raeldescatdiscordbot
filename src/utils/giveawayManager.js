const Giveaway = require('../models/Giveaway');

module.exports = (client) => {
    setInterval(async () => {
        const giveaways = await Giveaway.find({ ended: false, endAt: { $lte: Date.now() } });

        if (giveaways.length > 0) {
            // Need access to endGiveaway function. 
            // Better to export it from utils.
            // For now, I'll copy the logic or require it if I refactor.
            // Let's refactor `endGiveaway` to `src/utils/giveawayUtils.js`
            const { endGiveaway } = require('./giveawayUtils');

            for (const giveaway of giveaways) {
                await endGiveaway(client, giveaway);
            }
        }
    }, 10000); // Check every 10 seconds
};
