const { Events } = require('discord.js');
const { invitesCache } = require('../utils/inviteTracker');

module.exports = {
    name: Events.InviteCreate,
    execute(invite) {
        const guildInvites = invitesCache.get(invite.guild.id);
        if (guildInvites) {
            guildInvites.set(invite.code, invite.uses);
        }
    },
};
