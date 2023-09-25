import {
	EmbedBuilder,
	italic,
	type ActionRow,
	type MessageActionRowComponent,
	type RepliableInteraction,
	type InteractionReplyOptions,
	type WebhookEditOptions,
	ComponentType,
	ButtonStyle,
	Colors,
	type CommandInteraction,
	type MessageComponentInteraction,
	type ModalBuilder
} from 'discord.js';
import { type CustomId, parseCustomId } from '#utils/customIds';

export const safelyReply = (
	interaction: RepliableInteraction,
	payload: InteractionReplyOptions & WebhookEditOptions
) => {
	if (interaction.deferred) {
		return interaction.editReply(payload);
	}

	if (interaction.replied) {
		return interaction.followUp(payload);
	}

	return interaction.reply(payload);
};

export const createEmbed = (description?: string, color: number = Colors.Aqua) => {
	return new EmbedBuilder({ color, description });
};

export const sendSuccess = async (
	interaction: RepliableInteraction,
	description: string,
	options: { emoji?: string; ephemeral?: boolean } = {}
) => {
	const embed = createEmbed(`${options.emoji ?? '✅'} ${description}`);
	return safelyReply(interaction, { embeds: [embed], ephemeral: options.ephemeral ?? false });
};

export const sendError = (
	interaction: RepliableInteraction,
	description: string,
	options: { ephemeral?: boolean; prefix?: string; tip?: string } = {}
) => {
	const formattedError = `${options.prefix ?? '❌'} ${description.replace(/[!.?]*$/, '!')}`;
	const formattedDescription = `${formattedError}${options.tip ? `\n${italic(`💡${options.tip}`)}` : ''}`;

	return safelyReply(interaction, {
		embeds: [createEmbed(formattedDescription, Colors.Red)],
		ephemeral: options.ephemeral ?? true
	});
};

export const disableComponents = (
	rows: ActionRow<MessageActionRowComponent>[],
	options?: { enableOnly?: CustomId[]; preserveColorForOnly?: CustomId[] }
) => {
	for (const row of rows) {
		for (const component of row.components) {
			if (options?.preserveColorForOnly && component.type === ComponentType.Button) {
				const preserveColor = parseCustomId(component.customId!, {
					filter: options.preserveColorForOnly,
					parseArgs: false
				});

				if (preserveColor.isNone()) {
					Reflect.set(component.data, 'style', ButtonStyle.Secondary);
				}
			}

			if (options?.enableOnly && component.type === ComponentType.Button) {
				const enableOnly = parseCustomId(component.customId!, {
					filter: options.enableOnly,
					parseArgs: false
				});

				if (enableOnly.isSome()) {
					Reflect.set(component.data, 'disabled', false);
					continue;
				}
			}

			Reflect.set(component.data, 'disabled', true);
		}
	}

	return rows;
};

export const awaitModalSubmit = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	modal: ModalBuilder
) => {
	await interaction.showModal(modal);
	return interaction.awaitModalSubmit({
		time: 0,
		filter: (interaction) => interaction.customId === modal.data.custom_id
	});
};
