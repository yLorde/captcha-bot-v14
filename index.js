const {
	Client,
	GatewayIntentBits,
	ActivityType,
	Status,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

const fs = require('fs');
const config = require('./config.js');
const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessageTyping
	]
});

client.login(config.auth.token);

client.on('ready', () => {
	console.log('BOT INICIADO!');
	client.user.setPresence({
		status: Status.Idle,
		activities: [{
			name: 'YouTube: yLorde',
			type: ActivityType.Watching
		}],
		afk: false
	});

	var commands;
	commands = client.application.commands;

	commands.create({
		name: 'captchasetup',
		description: 'Envia o captcha para ser usado!',
	});
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName == "sendcaptcha") {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			interaction.reply({
				content: 'Você não possui permissão para isso! \`Administrador\`',
				ephemeral: true
			})
			return;
		};

		interaction.channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(config.captcha.title)
					.setDescription(config.captcha.description)
					.setColor(config.captcha.color)
			],
			components: [
				new ActionRowBuilder().addComponents([
					new ButtonBuilder()
						.setCustomId('catpcha')
						.setEmoji(config.captcha.emoji)
						.setStyle(ButtonStyle.Secondary)
				])
			]
		});

		interaction.reply({
			content: interaction.member.user.toString() + ' Captcha enviado com sucesso!',
			ephemeral: true
		});

		return;
	};
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isButton()) return;

	const cases = {
		catpcha: async () => {
			const { member, guild, channel, user } = interaction;
			try {
				const role = guild.roles.cache.get(config.captcha.role_id);
				if (!role) {
					interaction.reply({
						content: 'Informe à administração que o cargo está com erro de configuração!',
						ephemeral: true
					});
					return;
				};

				await member.roles.add(role);
				interaction.reply({
					content: config.captcha.sucess_message,
					ephemeral: true
				});


			} catch (err) {
				console.error(err)
				if (err) {
					interaction.reply({
						content: 'Houve um erro!',
						ephemeral: true
					});
				};
			};
		},
	};

	var handler = cases[interaction.customId];
	if (handler) await handler();
});