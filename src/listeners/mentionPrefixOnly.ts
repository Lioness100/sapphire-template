import type { Message } from 'discord.js';
import { Listener, Events } from '@sapphire/framework';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { inlineCode } from '@discordjs/builders';
import { getEnv } from '#utils/env';

export default class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
	public run(message: Message) {
		const prefix = getEnv('PREFIX').required().asString();

		return this.container.embed(message, `My prefix is ${inlineCode(prefix)}`, (embed) => {
			if (isDMChannel(message.channel)) {
				embed.setFooter("💡 Tip! You don't need a prefix in DMs!");
			}
		});
	}
}
