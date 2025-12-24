const { Events, EmbedBuilder } = require('discord.js');
const { getInviter } = require('../utils/inviteTracker');
const Invite = require('../models/Invite');
const JoinedMember = require('../models/JoinedMember');
const config = require('../../config');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // 1. Invite Tracking
        const inviter = await getInviter(member);
        let inviterData = null;

        if (inviter) {
            // Save who invited this user
            await JoinedMember.create({
                guildId: member.guild.id,
                userId: member.id,
                inviterId: inviter.id
            });

            // Update Inviter Stats
            inviterData = await Invite.findOne({ guildId: member.guild.id, userId: inviter.id });
            if (!inviterData) {
                inviterData = new Invite({ guildId: member.guild.id, userId: inviter.id });
            }

            inviterData.regular += 1;
            inviterData.invites += 1;
            await inviterData.save();
        }

        // 2. Welcome Message
        // TODO: Make channel configurable via DB or config. For now using general/system channel or first text channel
        const systemChannel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(member.guild.roles.everyone).has('SendMessages'));

        if (systemChannel) {
            let inviteInfo = 'Unknown';
            if (inviter) {
                inviteInfo = `${inviter.tag} (${inviterData ? inviterData.invites : 1} invites)`;
            } else if (member.user.bot) {
                inviteInfo = 'OAuth2 Authorization';
            } else {
                inviteInfo = 'Vanity URL / Unknown';
            }

            const embed = new EmbedBuilder()
                .setTitle(`Welcome to ${member.guild.name}!`)
                .setDescription(`Hello ${member}, welcome to our server! Please read the rules and have fun.`)
                .addFields(
                    { name: 'Invited By', value: inviteInfo, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor(config.colors.success)
                .setFooter({ text: `Member #${member.guild.memberCount}` });

            systemChannel.send({ content: `${member}`, embeds: [embed] });
        }

        // 3. Auto Role
        // TODO: Add auto role logic if ID is provided in config
    },
};
