import { inspect } from 'node:util';
import {
	Colors,
	codeBlock,
	TextInputBuilder,
	TextInputStyle,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	ActionRowBuilder,
	ComponentType,
	type ButtonInteraction
} from 'discord.js';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { Command } from '#structures/Command';
import { createEmbed, sendError } from '#utils/responses';
import { env } from '#root/config';
import { createCustomId, CustomId } from '#utils/customIds';

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
		const codeInput = new TextInputBuilder()
			.setCustomId(createCustomId(CustomId.Arbitrary))
			.setLabel(`${parameters.async ? 'Async' : ''}Code`)
			.setRequired(true)
			.setStyle(TextInputStyle.Paragraph);

		if (parameters.code) {
			codeInput.setValue(parameters.code);
		}

		const row = new ActionRowBuilder<TextInputBuilder>({ components: [codeInput] });
		const modal = new ModalBuilder({ components: [row] })
			.setTitle('Code Editor')
			.setCustomId(createCustomId(CustomId.Arbitrary));

		await interaction.showModal(modal);
		const submission = await interaction.awaitModalSubmit({ time: 0 }).catch(() => null);

		if (!submission) {
			return;
		}

		const message = await submission.deferReply({ ephemeral: parameters.ephemeral ?? false, fetchReply: true });
		const code = submission.fields.getTextInputValue('code-input');

		const { result, success } = await this.eval(interaction, code, parameters);
		const output = success ? codeBlock('js', result) : codeBlock('sh', result);

		const embedLimitReached = output.length > EmbedLimits.MaximumDescriptionLength;
		const embed = createEmbed(
			embedLimitReached ? 'Output was too long! The result has been sent as a file.' : output,
			success ? Colors.Aqua : Colors.Red
		);

		embed.setTitle(success ? 'Eval Result ✨' : 'Eval Error 💀');

		const files = [
			{ attachment: Buffer.from(code), name: 'input.txt' },
			...(embedLimitReached ? [{ attachment: Buffer.from(output), name: 'output.txt' }] : [])
		];

		const reviseButton = new ButtonBuilder() //
			.setCustomId(createCustomId(CustomId.Arbitrary))
			.setEmoji('🔁')
			.setLabel('Revise')
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>({ components: [reviseButton] });
		await submission.editReply({ embeds: [embed], components: [buttonRow], files });

		const buttonInteraction = await message
			.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 0,
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
		// @ts-expect-error 2345
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

		try {
			result = await eval(code);
		} catch (error) {
			result = `${error}`;
			success = false;
		}

		if (typeof result !== 'string') {
			result = inspect(result, { depth: parameters.depth });
		}

		return { result, success };
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
							.setDescription(
								'Whether to allow use of async/await. If set, the result will have to be returned'
							)
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
			{ guildIds: [env.DEV_SERVER_ID] }
		);
	}
}
