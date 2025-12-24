const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const Giveaway = require('../models/Giveaway');
const config = require('../../config');
const { endGiveaway, rerollGiveaway } = require('../utils/giveawayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Manage giveaways')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start a giveaway')
                .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 1h)').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(true))
                .addStringOption(opt => opt.setName('prize').setDescription('Prize').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('End a giveaway')
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('reroll')
                .setDescription('Reroll a giveaway winner')
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEvents)) { // or other perm
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'start') {
            const duration = interaction.options.getString('duration');
            const winnerCount = interaction.options.getInteger('winners');
            const prize = interaction.options.getString('prize');
            const endAt = Date.now() + ms(duration);

            if (!ms(duration)) return interaction.reply({ content: 'Invalid duration.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway! 🎉')
                .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**Hosted By:** ${interaction.user}\n**Ends:** <t:${Math.floor(endAt / 1000)}:R>`)
                .setColor(config.colors.primary)
                .setFooter({ text: 'React with 🎉 to enter!' });

            const message = await interaction.channel.send({ embeds: [embed] });
            await message.react('🎉');

            new Giveaway({
                messageId: message.id,
                channelId: interaction.channel.id,
                guildId: interaction.guild.id,
                prize,
                winnerCount,
                endAt,
                hostedBy: interaction.user.id
            }).save();

            await interaction.reply({ content: 'Giveaway started!', ephemeral: true });

        } else if (sub === 'end') {
            const messageId = interaction.options.getString('message_id');
            const giveaway = await Giveaway.findOne({ messageId, ended: false });

            if (!giveaway) return interaction.reply({ content: 'Giveaway not found or already ended.', ephemeral: true });

            await endGiveaway(interaction.client, giveaway);
            await interaction.reply({ content: 'Giveaway ended.', ephemeral: true });

        } else if (sub === 'reroll') {
            const messageId = interaction.options.getString('message_id');
            const giveaway = await Giveaway.findOne({ messageId, ended: true });

            if (!giveaway) return interaction.reply({ content: 'Giveaway not found or not ended.', ephemeral: true });

            await rerollGiveaway(interaction.client, giveaway);
            await interaction.reply({ content: 'Giveaway rerolled.', ephemeral: true });
        }
    },
};
