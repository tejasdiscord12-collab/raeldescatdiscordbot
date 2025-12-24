const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Warning = require('../models/Warning');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings of a user')
        .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');

        const warnings = await Warning.find({ guildId: interaction.guild.id, userId: targetUser.id }).sort({ timestamp: -1 });

        if (warnings.length === 0) {
            return interaction.reply({ content: `${targetUser.tag} has no warnings.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${targetUser.tag}`)
            .setColor(config.colors.warning)
            .setFooter({ text: `Total Warnings: ${warnings.length}` });

        // Discord fields limit is 25, we act smart
        const recentWarnings = warnings.slice(0, 10);

        recentWarnings.forEach((warn, index) => {
            embed.addFields({
                name: `Warning #${index + 1} - <t:${Math.floor(warn.timestamp.getTime() / 1000)}:R>`,
                value: `**Reason:** ${warn.reason}\n**Mod:** <@${warn.moderatorId}>`
            });
        });

        if (warnings.length > 10) {
            embed.setDescription(`Showing recent 10 warnings out of ${warnings.length}.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
