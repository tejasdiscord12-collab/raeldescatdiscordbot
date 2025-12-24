const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

async function logModAction(guild, action, target, moderator, reason) {
    const logChannelId = config.channels.modLogs;
    if (!logChannelId) return;

    const channel = guild.channels.cache.get(logChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle(`Moderation: ${action}`)
        .setColor(config.colors.warning)
        .addFields(
            { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Moderator', value: `${moderator.tag}`, inline: true },
            { name: 'Reason', value: reason || 'No reason provided', inline: false }
        )
        .setTimestamp();

    await channel.send({ embeds: [embed] });
}

module.exports = { logModAction };
