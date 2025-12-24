const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Ticket = require('../models/Ticket');
const config = require('../../config');

async function createTicket(interaction, type) {
    const { guild, user } = interaction;

    // Check if user already has an open ticket of this type?
    // For now, let's allow multiple or maybe limit to one per type.
    // const existingTicket = await Ticket.findOne({ userId: user.id, guildId: guild.id, type, closed: false });
    // if (existingTicket) return interaction.reply({ content: 'You already have an open ticket of this type.', ephemeral: true });

    const ticketName = `ticket-${user.username}`;

    const supportRole = guild.roles.cache.get(config.roles.support);

    const permissionOverwrites = [
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
        },
        {
            id: interaction.client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
        }
    ];

    if (supportRole) {
        permissionOverwrites.push({
            id: supportRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        });
    }

    const channel = await guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: config.channels.ticketCategory || null,
        permissionOverwrites,
        topic: `Ticket for ${user.tag} | Type: ${type}`
    });

    const ticket = new Ticket({
        guildId: guild.id,
        userId: user.id,
        channelId: channel.id,
        type: type
    });

    try {
        await ticket.save();
    } catch (err) {
        // If DB fails, delete the channel so we don't have empty channels lying around
        await channel.delete();
        throw err; // Re-throw to be caught by interaction handler
    }

    const embed = new EmbedBuilder()
        .setTitle('Ticket Created')
        .setDescription(`Hello ${user}, support will be with you shortly.\n\n**Type:** ${type}\n**Reason:** Please explain your issue below.`)
        .setColor(config.colors.primary);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Close')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('ticket_claim')
                .setLabel('Claim')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🙋‍♂️'),
            new ButtonBuilder()
                .setCustomId('ticket_more')
                .setLabel('More Options')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('➕')
        );

    await channel.send({ content: `${user}`, embeds: [embed], components: [row] });

    return channel;
}

async function closeTicket(interaction) {
    const channel = interaction.channel;
    const ticket = await Ticket.findOne({ channelId: channel.id });

    if (!ticket) return interaction.reply({ content: 'This is not a valid ticket channel.', ephemeral: true });

    // Save transcript logic here later

    ticket.closed = true;
    await ticket.save();

    interaction.reply({ content: 'Ticket will be closed in 5 seconds...' });

    setTimeout(() => {
        channel.delete().catch(() => { });
    }, 5000);
}

module.exports = { createTicket, closeTicket };
