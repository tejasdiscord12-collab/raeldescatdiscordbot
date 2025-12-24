const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

async function endGiveaway(client, giveaway) {
    const channel = client.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    try {
        const message = await channel.messages.fetch(giveaway.messageId);
        const reactions = message.reactions.cache.get('🎉');
        if (!reactions) return channel.send('No entries for the giveaway.');

        const users = await reactions.users.fetch();
        const validUsers = users.filter(u => !u.bot);

        if (validUsers.size === 0) {
            channel.send('No valid entries for the giveaway.');
            giveaway.ended = true;
            await giveaway.save();
            return;
        }

        const winners = validUsers.random(Math.min(giveaway.winnerCount, validUsers.size));
        const winnerMentions = Array.isArray(winners) ? winners.map(w => w.toString()).join(', ') : winners.toString();

        channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);

        giveaway.ended = true;
        giveaway.winners = Array.isArray(winners) ? winners.map(w => w.id) : [winners.id];
        await giveaway.save();

        // Update embed to show ended
        const embed = message.embeds[0];
        const newEmbed = new EmbedBuilder(embed)
            .setTitle('Giveaway Ended')
            .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnerMentions}\n**Hosted By:** <@${giveaway.hostedBy}>\n**Ended:** <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setColor(config.colors.secondary || '#808080'); // Grey

        await message.edit({ embeds: [newEmbed] });

    } catch (err) {
        console.error("Error ending giveaway:", err);
    }
}

async function rerollGiveaway(client, giveaway) {
    const channel = client.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    try {
        const message = await channel.messages.fetch(giveaway.messageId);
        const reactions = message.reactions.cache.get('🎉');
        const users = await reactions.users.fetch();
        const validUsers = users.filter(u => !u.bot);

        if (validUsers.size === 0) return channel.send('No valid entries for the reroll.');

        const winner = validUsers.random();
        channel.send(`🎉 Reroll! New winner is ${winner}! (Prize: **${giveaway.prize}**)`);
    } catch (err) {
        console.error("Error rerolling giveaway:", err);
    }
}

module.exports = { endGiveaway, rerollGiveaway };
