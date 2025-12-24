const { createTicket, closeTicket } = require('../utils/ticketUtils');

module.exports = {
    name: 'interactionCustom',
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_create_select') {
                await interaction.deferReply({ ephemeral: true });
                try {
                    const type = interaction.values[0];
                    const channel = await createTicket(interaction, type);
                    await interaction.editReply({ content: `✅ Ticket created: ${channel}` });
                } catch (error) {
                    console.error(error);
                    await interaction.editReply({ content: '❌ Failed to create ticket. Please contact an administrator.' });
                }
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
                await closeTicket(interaction);
            } else if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: `✅ Ticket claimed by ${interaction.user}!`, ephemeral: false });
                // Future: Add logic to update channel topic or permissions
            } else if (interaction.customId === 'ticket_more') {
                await interaction.reply({ content: '🔧 More options coming soon (Transcript, Add User, etc.)', ephemeral: true });
            }
        }
    },
};
