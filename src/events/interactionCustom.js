const { createTicket, closeTicket } = require('../utils/ticketUtils');

module.exports = {
    name: 'interactionCustom',
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_create_select') {
                const type = interaction.values[0];
                const channel = await createTicket(interaction, type);
                await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
                await closeTicket(interaction);
            } else if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: 'Ticket claimed!', ephemeral: true });
                // Add claim logic here (rename channel, add claiming user to permissions, etc.)
            }
        }
    },
};
