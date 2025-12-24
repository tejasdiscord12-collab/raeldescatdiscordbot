const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logModAction } = require('../utils/modUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user')
        .addStringOption(option => option.setName('userid').setDescription('The ID of the user to unban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for unban').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const user = await interaction.client.users.fetch(userId);
            await interaction.guild.members.unban(userId, reason);
            await interaction.reply({ content: `✅ **${user.tag}** has been unbanned.` });

            await logModAction(interaction.guild, 'Unban', user, interaction.user, reason);
        } catch (error) {
            return interaction.reply({ content: 'Failed to unban user. Please check the ID.', ephemeral: true });
        }
    },
};
