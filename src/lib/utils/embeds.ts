/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { ColorResolvable, Message, MessageEmbedOptions } from 'discord.js';
import { isFunction, isObject, isThenable } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import { getEnv } from '#utils/env';
import { send } from '@sapphire/plugin-editable-commands';

type EmbedModifier = ((embed: MessageEmbed) => unknown) | MessageEmbedOptions;

/**
 * Creates, edits, and optionally sends an embed with preferred presets
 */
export function embed(message: Message, desc: string, mod: EmbedModifier | true): Promise<Message>;
export function embed(message: Message, desc?: string, mod?: false): MessageEmbed;
export function embed(message: Message, desc?: string, mod?: EmbedModifier | boolean) {
	const color = getEnv('COLOR').asString() as ColorResolvable | undefined;

	const embed = new MessageEmbed({
		color,
		description: desc,
		author: {
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL({ size: 128, dynamic: true }),
			url: message.url
		}
	});

	if (mod) {
		let promise;
		if (isFunction(mod)) {
			promise = mod(embed);
		} else if (isObject(mod)) {
			Object.assign(embed, mod);
		}

		const sendEmbed = send.bind(null, message, { embeds: [embed] });

		if (isThenable(promise)) {
			return promise.then(sendEmbed);
		}

		return sendEmbed();
	}

	return embed;
}

/**
 * Creates, edits, and sends an error message with preferred presets. Uses the {@link embed} function.
 */
export const error = (message: Message, desc: string, mod: EmbedModifier = {}): Promise<Message> => {
	return embed(
		message,
		// core sapphire errors end in ".", so that needs to be accounted for
		`❌ ${desc.replace(/.$/, '!')}`,
		isFunction(mod)
			? (embed) => {
					embed.setColor('RED');
					return mod(embed);
			  }
			: { color: 15548997 /* RED */, ...mod }
	);
};

/**
 * Adds any amount of fields and prefixes the "❯" character to each field name for visuals
 */
export const addFields = (embed: MessageEmbed, fields: [name: string, value: string][]) => {
	return embed.addFields(fields.map(([name, value]) => ({ name: `❯ ${name}`, value })));
};
