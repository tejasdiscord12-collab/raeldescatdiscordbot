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
                .setTitle('🎫 Help Desk')
                .setDescription('Please select a category below to open a ticket.')
                .setColor(config.colors.primary)
                .setFooter({ text: 'Powered by Hexonode' });

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
