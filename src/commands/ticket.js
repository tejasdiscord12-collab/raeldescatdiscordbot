const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system commands')
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Setup the ticket panel')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            // Check permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Hexonode Tickets', iconURL: interaction.guild.iconURL() }) // Assuming bot has access to guild icon
                .setTitle('📨 Help Desk')
                .setDescription(
                    `🚨 **To ensure efficient support for everyone, please adhere to the following guidelines when creating a ticket.**\n\n` +
                    `**» Select the Correct Ticket Type:**\n` +
                    `*First, use the dropdown menu to choose the category that best fits your request (e.g., Purchase, Bug Report, Support). This ensures your ticket goes to the right team immediately.*\n\n` +
                    `**» State Your Purpose Clearly:**\n` +
                    `*After selecting a type, describe your reason for the ticket. Provide all necessary details concisely for a faster resolution.*\n\n` +
                    `**» Stay Active:**\n` +
                    `*Please remain active in your ticket. Tickets will be automatically closed if we do not receive a reply from you within 48 hours.*\n\n` +
                    `• *Valid Tickets Only: Tickets must contain a clear message.*\n` +
                    `• *Empty tickets will be closed after 10 minutes.*\n\n` +
                    `ℹ **Creating false tickets or opening them without a valid reason will result in timeout.**`
                )
                .setColor(config.colors.primary)
                .setFooter({ text: '~ Team Hexonode' });

            const select = new StringSelectMenuBuilder()
                .setCustomId('ticket_create_select')
                .setPlaceholder('Select a category')
                .addOptions(
                    {
                        label: 'Server / VPS Purchase',
                        description: 'Buying Minecraft servers, VPS, hosting plans',
                        value: 'purchase',
                        emoji: '🖥',
                    },
                    {
                        label: 'General Support',
                        description: 'Questions, help, guidance',
                        value: 'support',
                        emoji: '🛠',
                    },
                    {
                        label: 'Server Issue / Bug Report',
                        description: 'Downtime, lag, errors',
                        value: 'issue',
                        emoji: '⚠',
                    },
                    {
                        label: 'Billing / Payment Issue',
                        description: 'Failed payments, refunds',
                        value: 'billing',
                        emoji: '💰',
                    },
                    {
                        label: 'Partnership / Business',
                        description: 'Collaborations',
                        value: 'partnership',
                        emoji: '🤝',
                    },
                );

            const row = new ActionRowBuilder().addComponents(select);

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: 'Ticket panel sent!', ephemeral: true });
        }
    },
};
