const { Events } = require('discord.js');
const { cacheInvites } = require('../utils/inviteTracker');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        await cacheInvites(client);
        require('../utils/giveawayManager')(client); // Start giveaway manager
    },
};
