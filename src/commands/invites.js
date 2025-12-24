const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Invite = require('../models/Invite');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check invite statistics')
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View invites')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('leaderboard')
                .setDescription('View top inviters')
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand() || 'view';

        if (sub === 'view') {
            const user = interaction.options.getUser('user') || interaction.user;
            const inviteData = await Invite.findOne({ guildId: interaction.guild.id, userId: user.id });

            const regular = inviteData ? inviteData.regular : 0;
            const active = inviteData ? inviteData.invites : 0;
            const fake = inviteData ? inviteData.fake : 0;
            const bonus = inviteData ? inviteData.bonus : 0;

            const embed = new EmbedBuilder()
                .setTitle(`Invites for ${user.username}`)
                .setColor(config.colors.primary)
                .setDescription(`**${active}** Active Invites\n(${regular} Regular, ${fake} Left, ${bonus} Bonus)`)
                .setFooter({ text: 'Invite tracking system' });

            await interaction.reply({ embeds: [embed] });

        } else if (sub === 'leaderboard') {
            const top = await Invite.find({ guildId: interaction.guild.id }).sort({ invites: -1 }).limit(10);

            if (top.length === 0) {
                return interaction.reply({ content: 'No invites found.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Invite Leaderboard')
                .setColor(config.colors.primary);

            let desc = '';
            for (let i = 0; i < top.length; i++) {
                const data = top[i];
                desc += `**${i + 1}.** <@${data.userId}> - **${data.invites}** invites (${data.regular} reg, ${data.fake} left)\n`;
            }

            embed.setDescription(desc);
            await interaction.reply({ embeds: [embed] });
        }
    },
};
