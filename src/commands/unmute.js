const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logModAction } = require('../utils/modUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes timeout from a user')
        .addUserOption(option => option.setName('user').setDescription('The user to unmute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for unmute').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
        }

        await member.timeout(null, reason);
        await interaction.reply({ content: `✅ **${user.tag}** has been unmuted.` });

        await logModAction(interaction.guild, 'Unmute', user, interaction.user, reason);
    },
};
