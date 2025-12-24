const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const CustomCommand = require('../models/CustomCommand');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Manage custom commands')
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a new custom command')
                .addStringOption(opt => opt.setName('name').setDescription('Command name (without prefix)').setRequired(true))
                .addStringOption(opt => opt.setName('response').setDescription('Command response').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a custom command')
                .addStringOption(opt => opt.setName('name').setDescription('Command name').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all custom commands')
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const name = interaction.options.getString('name').toLowerCase();
            const response = interaction.options.getString('response');

            const existing = await CustomCommand.findOne({ guildId: interaction.guild.id, name });
            if (existing) {
                return interaction.reply({ content: `Command \`${name}\` already exists.`, ephemeral: true });
            }

            const cmd = new CustomCommand({
                guildId: interaction.guild.id,
                name,
                response,
                createdBy: interaction.user.id
            });
            await cmd.save();
            await interaction.reply({ content: `✅ Command \`${name}\` created.` });

        } else if (sub === 'delete') {
            const name = interaction.options.getString('name').toLowerCase();
            const deleted = await CustomCommand.findOneAndDelete({ guildId: interaction.guild.id, name });

            if (!deleted) {
                return interaction.reply({ content: `Command \`${name}\` not found.`, ephemeral: true });
            }
            await interaction.reply({ content: `🗑 Command \`${name}\` deleted.` });

        } else if (sub === 'list') {
            const commands = await CustomCommand.find({ guildId: interaction.guild.id });

            if (commands.length === 0) {
                return interaction.reply({ content: 'No custom commands found.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Custom Commands')
                .setColor(config.colors.primary)
                .setDescription(commands.map(c => `• \`${c.name}\``).join('\n'));

            await interaction.reply({ embeds: [embed] });
        }
    },
};
