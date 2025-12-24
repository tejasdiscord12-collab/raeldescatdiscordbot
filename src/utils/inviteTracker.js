const { Collection } = require('discord.js');
const Invite = require('../models/Invite');

// Cache to store invites: guildId -> code -> inviteObject
const invitesCache = new Collection();

async function cacheInvites(client) {
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const firstInvites = await guild.invites.fetch();
            invitesCache.set(guildId, new Collection(firstInvites.map(invite => [invite.code, invite.uses])));
        } catch (err) {
            console.log(`Failed to cache invites for guild ${guildId}: ${err}`);
        }
    }
}

async function getInviter(member) {
    const guildInvites = invitesCache.get(member.guild.id);
    if (!guildInvites) return null;

    try {
        const newInvites = await member.guild.invites.fetch();
        // Update cache and find which one incremented
        let inviteUsed = null;

        for (const [code, useCount] of newInvites) {
            const cachedCount = guildInvites.get(code) || 0;
            if (useCount > cachedCount) {
                inviteUsed = newInvites.get(code);
                break; // Found it
            }
        }

        // Update cache
        invitesCache.set(member.guild.id, new Collection(newInvites.map(invite => [invite.code, invite.uses])));

        return inviteUsed ? inviteUsed.inviter : null;

    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { cacheInvites, getInviter, invitesCache };
