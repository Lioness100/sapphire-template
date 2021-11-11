import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '#structures/Command';

@ApplyOptions<Command.Options>({
	aliases: ['pong', 'latency'],
	description: 'View my latency',
	detailedDescription: [
		'Shows the bot latency (the ping of the websocket)',
		'and the API latency (how quickly I can communicate with Discord)'
	].join(' ')
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const msg = await this.embed(message, '', { title: 'Ping? 🏓' });

		const bot = Math.round(this.client.ws.ping);
		const api = msg.createdTimestamp - message.createdTimestamp;
		const embed = this.embed(message, `Bot Latency - ${bot}ms\nAPI Latency - ${api}ms.`).setTitle('Pong! 🏓');

		return msg.edit({ embeds: [embed] });
	}
}
