const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logModAction } = require('../utils/modUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for kick').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });
        if (!member.kickable) return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });

        await member.kick(reason);
        await interaction.reply({ content: `✅ **${user.tag}** has been kicked.` });

        await logModAction(interaction.guild, 'Kick', user, interaction.user, reason);
    },
};
