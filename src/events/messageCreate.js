const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
const toxicWords = require('../data/toxicWords.json');
const Warning = require('../models/Warning');
const CustomCommand = require('../models/CustomCommand');
const ToxicWord = require('../models/ToxicWord');
const config = require('../../config');
const ms = require('ms');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        // --- Custom Commands ---
        if (message.content.startsWith(config.prefix)) {
            const args = message.content.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const customCmd = await CustomCommand.findOne({ guildId: message.guild.id, name: commandName });
            if (customCmd) {
                return message.channel.send(customCmd.response);
            }
        }

        // --- Auto Reply System ---
        if (content.includes('price') || content.includes('pricing')) {
            const embed = new EmbedBuilder()
                .setTitle('Pricing Plans')
                .setDescription('Check out our hosting plans at [example.com/pricing](https://example.com/pricing)') // Replace with actual URL if known
                .setColor(config.colors.success);
            return message.channel.send({ embeds: [embed] });
        }

        if (content.includes('payment') || content.includes('pay')) {
            const embed = new EmbedBuilder()
                .setTitle('Payment Methods')
                .setDescription('We accept PayPal, Credit Cards, and UPI.')
                .setColor(config.colors.primary);
            return message.channel.send({ embeds: [embed] });
        }

        if (content === 'ping') {
            const sent = await message.reply({ content: 'Pinging...', fetchReply: true });
            sent.edit(`Pong! Latency: ${sent.createdTimestamp - message.createdTimestamp}ms. API Latency: ${Math.round(message.client.ws.ping)}ms`);
            return;
        }

        // --- Auto Delete / Anti-Link ---
        // Allow admins/mods to bypass
        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isAdmin) {
            // Invite Links
            const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;
            if (inviteRegex.test(message.content)) {
                await message.delete().catch(() => { });
                return message.channel.send(`${message.author}, invite links are not allowed!`).then(m => setTimeout(() => m.delete(), 5000));
            }

            // Scam Links (Basic check)
            const scamRegex = /free nitro|steam nitro|gift/i;
            if (scamRegex.test(message.content)) {
                await message.delete().catch(() => { });
                return message.channel.send(`${message.author}, scam links are not allowed!`).then(m => setTimeout(() => m.delete(), 5000));
            }
        }

        // --- Auto Abuse Filter ---
        // Check for toxic words (Default + DB)
        const dbWords = await ToxicWord.find({ guildId: message.guild.id });
        const allToxicWords = [...toxicWords, ...dbWords.map(w => w.word)];

        const foundToxicWord = allToxicWords.find(word => content.includes(word));

        if (foundToxicWord && !isAdmin) {
            await message.delete().catch(() => { });

            const reason = `Auto-Mod: Used abusive word (${foundToxicWord})`;

            // Log locally or reply
            const warningMsg = await message.channel.send(`${message.author}, please do not use abusive language! (Word: ||${foundToxicWord}||)`);
            setTimeout(() => warningMsg.delete().catch(() => { }), 5000);

            // Add Warning Logic
            const warning = new Warning({
                guildId: message.guild.id,
                userId: message.author.id,
                moderatorId: message.client.user.id,
                reason: reason
            });
            await warning.save();

            const warningCount = await Warning.countDocuments({ guildId: message.guild.id, userId: message.author.id });

            if (warningCount >= 3) {
                if (message.member.bannable) {
                    await message.member.ban({ reason: 'Auto-ban: 3rd strike for abusive language.' });
                    message.channel.send(`${message.author} has been banned for repeated abusive language.`);
                }
            } else if (warningCount >= 2) {
                if (message.member.moderatable) {
                    await message.member.timeout(ms('1h'), 'Auto-mute: 2nd strike for abusive language.');
                    message.channel.send(`${message.author} has been muted for 1 hour for repeated abusive language.`);
                }
            } else {
                message.channel.send(`${message.author} has been warned. Next violation will result in a mute.`);
            }
        }
    },
};
