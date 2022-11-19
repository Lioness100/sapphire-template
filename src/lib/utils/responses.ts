import {
	EmbedBuilder,
	Colors,
	italic,
	type ActionRow,
	type MessageActionRowComponent,
	type RepliableInteraction,
	type InteractionReplyOptions,
	type WebhookEditMessageOptions,
	ComponentType,
	ButtonStyle
} from 'discord.js';
import { type CustomId, parseCustomId } from '#utils/customIds';

export const safelyReply = (
	interaction: RepliableInteraction,
	payload: InteractionReplyOptions & WebhookEditMessageOptions
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

export const sendSuccess = async (interaction: RepliableInteraction, description: string) => {
	const embed = createEmbed(`✅ ${description}`);
	return interaction.reply({ embeds: [embed] });
};

export const sendError = async (
	interaction: RepliableInteraction,
	description: string,
	options: { ephemeral?: boolean; prefix?: string; tip?: string } = {}
) => {
	const formattedError = `${options.prefix ?? '❌'} ${description.replace(/[!.?]*$/, '!')}`;
	const formattedDescription = `${formattedError}${options.tip ? `\n${italic(`💡${options.tip}`)}` : ''}`;

	await safelyReply(interaction, {
		embeds: [createEmbed(formattedDescription, Colors.Red)],
		ephemeral: options.ephemeral ?? true
	});
};

export const disableComponents = (
	rows: ActionRow<MessageActionRowComponent>[],
	options?: { preserveColorForOnly?: CustomId }
) => {
	return rows.map((row) =>
		row.components.map((component) => {
			if (options?.preserveColorForOnly && component.type === ComponentType.Button) {
				const preserveColor = parseCustomId(component.customId!, {
					filter: [options.preserveColorForOnly],
					parseAgs: false
				});

				if (preserveColor.isNone()) {
					Reflect.set(component.data, 'style', ButtonStyle.Secondary);
				}
			}

			return Reflect.set(component.data, 'disabled', true);
		})
	);
};
