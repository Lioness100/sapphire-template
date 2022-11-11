import {
	EmbedBuilder,
	Colors,
	italic,
	type ActionRow,
	type MessageActionRowComponent,
	type RepliableInteraction,
	type InteractionReplyOptions,
	type WebhookEditMessageOptions
} from 'discord.js';

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
	// Core sapphire errors end in ".", so that needs to be accounted for.
	const formattedError = `${options.prefix ?? '❌'} ${
		description.endsWith('.') ? description.slice(0, -1) : description
	}!`;
	const formattedDescription = `${formattedError}${options.tip ? `\n${italic(`💡${options.tip}`)}` : ''}`;

	await safelyReply(interaction, {
		embeds: [createEmbed(formattedDescription, Colors.Red)],
		ephemeral: options.ephemeral ?? true
	});
};

export const toggleComponents = (rows: ActionRow<MessageActionRowComponent>[]) => {
	return rows.map((row) =>
		row.components.map((component) => {
			return Reflect.set(component.data, 'disabled', !component.disabled);
		})
	);
};
