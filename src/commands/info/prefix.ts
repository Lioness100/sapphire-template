import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '#structures/Command';

@ApplyOptions<Command.Options>({
	aliases: ['p'],
	description: 'View my prefix',
	tip: 'You can also access this command by mentioning me!'
})
export class UserCommand extends Command {
	public messageRun(message: Message) {
		return this.container.client.emit('mentionPrefixOnly', message);
	}
}
