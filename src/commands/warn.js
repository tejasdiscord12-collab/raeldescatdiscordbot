const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Warning = require('../models/Warning');
const config = require('../../config');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for warning').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }

        // Save warning
        const warning = new Warning({
            guildId: interaction.guild.id,
            userId: targetUser.id,
            moderatorId: interaction.user.id,
            reason: reason
        });
        await warning.save();

        // Check total warnings for auto-punishment
        const warningCount = await Warning.countDocuments({ guildId: interaction.guild.id, userId: targetUser.id });

        let actionTaken = 'Warned';

        if (warningCount >= 5) {
            // Auto Ban
            if (member.bannable) {
                await member.ban({ reason: `Auto-ban: Reached 5 warnings. Last reason: ${reason}` });
                actionTaken = 'Auto-Banned (5 Warnings)';
            } else {
                actionTaken = 'Warned (Could not auto-ban: Missing permissions)';
            }
        } else if (warningCount >= 3) {
            // Auto Mute (Timeout for 1 hour)
            if (member.moderatable) {
                await member.timeout(ms('1h'), `Auto-mute: Reached 3 warnings. Last reason: ${reason}`);
                actionTaken = 'Auto-Muted 1h (3 Warnings)';
            } else {
                actionTaken = 'Warned (Could not auto-mute: Missing permissions)';
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`User ${actionTaken}`)
            .setColor(config.colors.warning)
            .addFields(
                { name: 'User', value: `${targetUser.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Total Warnings', value: `${warningCount}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // DM the user
        try {
            await targetUser.send(`You were **${actionTaken}** in **${interaction.guild.name}**\nReason: ${reason}`);
        } catch (err) {
            // Cannot DM
        }
    },
};
