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
	type ButtonInteraction,
	type Interaction
} from 'discord.js';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/framework';
import { Command } from '#structures/Command';
import { createEmbed } from '#utils/responses';
import { env } from '#root/config';
import { createCustomId, CustomId } from '#utils/customIds';

export class EvalCommand extends Command {
	public override async chatInputRun(interaction: Command.Interaction) {
		const async = interaction.options.getBoolean('async');
		await EvalCommand.sendForm(interaction, {
			async,
			depth: interaction.options.getInteger('depth'),
			ephemeral: interaction.options.getBoolean('ephemeral'),
			code: async ? "// const _ = await import('');" : null
		});
	}

	public static async sendForm(
		interaction: Command.Interaction | ButtonInteraction,
		parameters: EvalCommand.Options
	) {
		const codeInput = new TextInputBuilder()
			.setCustomId(CustomId.CodeInput)
			.setLabel(`${parameters.async ? 'Async ' : ''}Code`)
			.setRequired(true)
			.setStyle(TextInputStyle.Paragraph);

		if (parameters.code) {
			codeInput.setValue(parameters.code);
		}

		const row = new ActionRowBuilder<TextInputBuilder>({ components: [codeInput] });
		const modal = new ModalBuilder({ components: [row] }).setTitle('Code Editor').setCustomId(CustomId.Arbitrary);

		await interaction.showModal(modal);
		const submission = await interaction.awaitModalSubmit({ time: 0 }).catch(() => null);

		if (!submission) {
			return;
		}

		await submission.deferReply({ ephemeral: parameters.ephemeral ?? true, fetchReply: true });
		const code = submission.fields.getTextInputValue(CustomId.CodeInput);

		const input = codeBlock('js', code);
		const inputEmbed = createEmbed(input).setTitle('Eval Input 📤');

		const result = await EvalCommand.eval(interaction, code, parameters);
		const output = codeBlock(result.isOk() ? 'js' : 'sh', result.intoOkOrErr());

		const embedLimitReached = output.length > EmbedLimits.MaximumDescriptionLength;
		const resultEmbed = createEmbed(
			embedLimitReached ? 'Output was too long! The result has been sent as a file.' : output,
			result.isErr() ? Colors.Red : undefined
		).setTitle(`Eval ${result.isOk() ? 'Result ✨' : 'Error 💀'}`);

		const reviseButtonCustomId = createCustomId(
			CustomId.ReviseCodeButton,
			interaction.user.id,
			parameters.async ?? undefined,
			parameters.depth ?? undefined,
			parameters.ephemeral ?? undefined
		);

		const reviseButton = new ButtonBuilder()
			.setCustomId(reviseButtonCustomId)
			.setEmoji('🔁')
			.setLabel('Revise')
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>({ components: [reviseButton] });
		await submission.editReply({
			embeds: [inputEmbed, resultEmbed],
			components: [buttonRow],
			files: embedLimitReached ? [{ attachment: Buffer.from(output), name: 'output.txt' }] : []
		});
	}

	// @ts-expect-error 2345 - interaction should be available in the scope of eval.
	private static async eval(interaction: Interaction, code: string, parameters: EvalCommand.Options) {
		if (parameters.async) {
			code = `(async () => {${code}})();`;
		}

		const result = await Result.fromAsync(async () => {
			const result = await (0, eval)(code);
			return typeof result === 'string' ? result : inspect(result, { depth: parameters.depth });
		});

		return result.mapErr((error) => `${error}`);
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
			{ guildIds: [env.DEV_SERVER_ID], idHints: ['1041005977501175878'] }
		);
	}
}

export namespace EvalCommand {
	export interface Options {
		async?: boolean | null;
		code?: string | null;
		depth?: number | null;
		ephemeral?: boolean | null;
	}
}
