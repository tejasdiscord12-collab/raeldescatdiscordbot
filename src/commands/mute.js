const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const { logModAction } = require('../utils/modUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeouts a user')
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Duration (e.g. 1h, 30m)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for mute').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const durationInput = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });
        if (!member.moderatable) return interaction.reply({ content: 'I cannot mute this user.', ephemeral: true });

        const duration = ms(durationInput);
        if (!duration) return interaction.reply({ content: 'Invalid duration format.', ephemeral: true });

        await member.timeout(duration, reason);
        await interaction.reply({ content: `✅ **${user.tag}** has been muted for **${durationInput}**.` });

        await logModAction(interaction.guild, 'Mute', user, interaction.user, `${reason} (Duration: ${durationInput})`);
    },
};
