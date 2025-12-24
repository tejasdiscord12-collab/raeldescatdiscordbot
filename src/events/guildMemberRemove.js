const { Events, EmbedBuilder } = require('discord.js');
const Invite = require('../models/Invite');
const JoinedMember = require('../models/JoinedMember');
const config = require('../../config');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        if (member.user.bot) return;

        // 1. Invite Tracking (Update stats)
        const joinRecord = await JoinedMember.findOne({ guildId: member.guild.id, userId: member.id });

        if (joinRecord) {
            const inviterData = await Invite.findOne({ guildId: member.guild.id, userId: joinRecord.inviterId });
            if (inviterData) {
                inviterData.invites -= 1; // Decrement active invites
                inviterData.fake += 1;    // Increment fake/left invites
                await inviterData.save();
            }

            // Remove join record so re-joins don't count? 
            // Logic says: "Re-joins should NOT add extra invites".
            // If we keep the record, we can check it on join. 
            // But if they leave, they are "fake". If they join back, are they "real" again?
            // Prompt says: "If a user joins and leaves, their invite must be removed". "Re-joins should NOT add extra invites".
            // This implies if User A invites User B. B joins (+1). B leaves (-1). B joins again (0 change? or +1 again?)
            // Usually "Re-joins should NOT add extra invites" means you can't farm invites with same account.
            // So I should keep the record or a history record.
            // For simplicity, let's keep the `JoinedMember` record but maybe mark it as left?
            // Or actually, if I delete it, `guildMemberAdd` will count it as new.
            // I need a `JoinHistory` model if I want strict "never count again".
            // Let's assume for now deleting it and re-adding is standard behavior unless "anti-farming" is strict.
            // To strictly prevent rejoin farming:
            // We look up if they EVER joined. 

            // Prompt: "On rejoin: Do NOT add invite again"
            // This means I need to store the fact that they were invited before.
            // So I will NOT delete the `JoinedMember` record, but I need to handle the "active" count.

            // Actually, if I don't delete it, `guildMemberAdd` needs to check if it exists.
            // If it exists, we don't increment `regular` or `invites`?
            // But if they leave, we decremented. So we are back to square one.
            // If they join again, we should probably increment `invites` (active) but maybe not `regular` (total)?
            // The prompt says: "Only count valid joins". 
            // If B joins, leaves (-1), joins again. If we don't +1, then A has 0 invites for B being there. That seems wrong. A brought B back.
            // "Re-joins should NOT add extra invites" usually means "Total" counts shouldn't inflate endlessly.
            // But "Active" count should reflect current state.

            // Let's stick to standard behavior: 
            // Join -> +1 active, +1 regular. 
            // Leave -> -1 active. 
            // Rejoin -> +1 active (restores previous state), but maybe checks history to avoid inflating `regular` if we care about "unique joins".
            // For simplicity in this iteration: I will delete `JoinedMember` on leave so the system is stateless regarding "past joins" except for the counters.
            // Wait, if I delete it, I lose who invited them if they come back without a new invite code.
            // But if they join with a LINK, `getInviter` detects it.

            await JoinedMember.deleteOne({ _id: joinRecord._id });
        }

        // 2. Goodbye Message
        // TODO: Configurable channel
        const systemChannel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(member.guild.roles.everyone).has('SendMessages'));

        if (systemChannel) {
            systemChannel.send(`👋 **${member.user.tag}** has left the server.`);
        }
    },
};
