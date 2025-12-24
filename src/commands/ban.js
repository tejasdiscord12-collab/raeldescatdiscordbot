const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logModAction } = require('../utils/modUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for ban').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member && !member.bannable) return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });

        await interaction.guild.members.ban(user, { reason });
        await interaction.reply({ content: `✅ **${user.tag}** has been banned.` });

        await logModAction(interaction.guild, 'Ban', user, interaction.user, reason);
    },
};
