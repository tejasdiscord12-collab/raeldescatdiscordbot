const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const ToxicWord = require('../models/ToxicWord');
const config = require('../../config');
const defaultToxicWords = require('../data/toxicWords.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Manage toxic words filter')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a word to the filter')
                .addStringOption(opt => opt.setName('word').setDescription('Word to blacklist').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a word from the filter')
                .addStringOption(opt => opt.setName('word').setDescription('Word to remove').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List blacklisted words')
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const word = interaction.options.getString('word').toLowerCase();

            const existing = await ToxicWord.findOne({ guildId: interaction.guild.id, word });
            if (existing) return interaction.reply({ content: 'Word is already blacklisted.', ephemeral: true });

            await ToxicWord.create({ guildId: interaction.guild.id, word });
            await interaction.reply({ content: `✅ Added **${word}** to blacklist.` });

        } else if (sub === 'remove') {
            const word = interaction.options.getString('word').toLowerCase();

            const deleted = await ToxicWord.findOneAndDelete({ guildId: interaction.guild.id, word });
            if (!deleted) return interaction.reply({ content: 'Word not found in blacklist.', ephemeral: true });

            await interaction.reply({ content: `✅ Removed **${word}** from blacklist.` });

        } else if (sub === 'list') {
            const customWords = await ToxicWord.find({ guildId: interaction.guild.id });
            const words = [...defaultToxicWords, ...customWords.map(w => w.word)];

            const embed = new EmbedBuilder()
                .setTitle('Blacklisted Words')
                .setColor(config.colors.warning)
                .setDescription(words.join(', ') || 'No words blacklisted.');

            await interaction.reply({ embeds: [embed] });
        }
    },
};
