const { Events } = require('discord.js');
const { invitesCache } = require('../utils/inviteTracker');

module.exports = {
    name: Events.InviteDelete,
    execute(invite) {
        const guildInvites = invitesCache.get(invite.guild.id);
        if (guildInvites) {
            guildInvites.delete(invite.code);
        }
    },
};
