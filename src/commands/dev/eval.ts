import { type Message, Constants, MessageActionRow, MessageButton, Modal, TextInputComponent, type ButtonInteraction } from 'discord.js';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { createEmbed, sendError } from '#utils/responses';
import { EmbedColor } from '#utils/constants';
import { isThenable } from '@sapphire/utilities';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock } from '@discordjs/builders';
import { Command } from '#structures/Command';
import { inspect } from 'node:util';
import { Buffer } from 'node:buffer';
import { Type } from '@sapphire/type';
import { env } from '#root/config';

export class EvalCommand extends Command {
	public override async chatInputRun(interaction: Command.Interaction) {
		const async = interaction.options.getBoolean('async');
		await this.sendForm(interaction, {
			async,
			depth: interaction.options.getInteger('depth'),
			ephemeral: interaction.options.getBoolean('ephemeral'),
			code: async ? "// const _ = await import('');" : null
		});
	}

	public async sendForm(
		interaction: Command.Interaction | ButtonInteraction,
		parameters: {
			async: boolean | null;
			code: string | null;
			depth: number | null;
			ephemeral: boolean | null;
		}
	) {
		const codeInput = new TextInputComponent() //
			.setCustomId('code-input')
			.setLabel(`${parameters.async ? 'Async' : ''}Code`)
			.setRequired(true)
			.setStyle('PARAGRAPH');

		if (parameters.code) {
			codeInput.setValue(parameters.code);
		}

		const row = new MessageActionRow<TextInputComponent>().setComponents(codeInput);
		const modal = new Modal().setTitle('Code Editor').setCustomId('code-form').setComponents(row);

		await interaction.showModal(modal);
		const submission = await interaction.awaitModalSubmit({ time: 0 }).catch(() => null);

		if (!submission) {
			return;
		}

		const message = (await submission.deferReply({ ephemeral: parameters.ephemeral ?? false, fetchReply: true })) as Message;
		const code = submission.fields.getTextInputValue('code-input');

		const { result, success, type, elapsed } = await this.eval(interaction, code, parameters);
		const output = success ? codeBlock('js', result) : codeBlock('bash', result);

		const embedLimitReached = output.length > EmbedLimits.MaximumDescriptionLength;
		const embed = createEmbed(
			embedLimitReached ? 'Output was too long! The result has been sent as a file.' : output,
			success ? EmbedColor.Primary : EmbedColor.Error
		);

		embed
			.setTitle(success ? 'Eval Result ✨' : 'Eval Error 💀')
			.addField('Type 📝', codeBlock('ts', type), true)
			.addField('Elapsed ⏱', elapsed, true);

		const files = embedLimitReached ? [{ attachment: Buffer.from(output), name: 'output.txt' }] : [];

		const reviseButton = new MessageButton()
			.setCustomId('revise-code')
			.setEmoji('🔁')
			.setLabel('Revise')
			.setStyle(Constants.MessageButtonStyles.PRIMARY);

		const buttonRow = new MessageActionRow().setComponents(reviseButton);
		await submission.editReply({ embeds: [embed], components: [buttonRow], files });

		const buttonInteraction = await message
			.awaitMessageComponent({
				componentType: Constants.MessageComponentTypes.BUTTON,
				time: 1000 * 60 * 5,
				filter: async (buttonInteraction) => {
					if (buttonInteraction.user.id !== interaction.user.id) {
						await sendError(interaction, `This button is only for ${interaction.user}`);
						return false;
					}

					return true;
				}
			})
			.catch(() => null);

		if (!buttonInteraction) {
			return;
		}

		await this.sendForm(buttonInteraction, { ...parameters, code });
	}

	private async eval(
		interaction: Command.Interaction | ButtonInteraction,
		code: string,
		parameters: {
			async: boolean | null;
			depth: number | null;
		}
	) {
		if (parameters.async) {
			code = `(async () => {\n${code}\n})();`;
		}

		let success = true;
		let result;

		const stopwatch = new Stopwatch();
		let elapsed = '';

		try {
			// This will serve as an alias for ease of use in the eval code.
			// @ts-expect-error 6133
			const i = interaction;

			// eslint-disable-next-line no-eval
			result = eval(code);
			elapsed = stopwatch.toString();

			if (isThenable(result)) {
				stopwatch.restart();
				result = await result;
				elapsed = stopwatch.toString();
			}
		} catch (error) {
			if (!elapsed) {
				elapsed = stopwatch.toString();
			}

			result = (error as Error).message ?? error;
			success = false;
		}

		stopwatch.stop();

		const type = new Type(result).toString();

		if (typeof result !== 'string') {
			result = inspect(result, { depth: parameters.depth });
		}

		return { result, success, type, elapsed };
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription('[owner only] Evaluate any JavaScript code')
					.addBooleanOption((option) =>
						option
							.setName('async')
							.setDescription('Whether to allow use of async/await. If set, the result will have to be returned')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('ephemeral')
							.setDescription('Whether to show the result ephemerally')
							.setRequired(false)
					)
					.addIntegerOption((option) =>
						option //
							.setName('depth')
							.setDescription('The depth of the displayed return type')
							.setRequired(false)
					),
			{ idHints: ['981662208041840640'], guildIds: [env.DEV_SERVER_ID] }
		);
	}
}
