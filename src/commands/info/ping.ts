import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({
  aliases: ['pong', 'latency'],
  description: 'Shows my latency',
  detailedDescription: [
    'Shows the bot latency (the ping of the websocket)',
    'and the API latency (how quickly I can communicate with Discord)',
  ].join(' '),
})
export class UserCommand extends Command {
  public async run(message: Message) {
    const msg = await this.embed(message, '', { title: 'Ping? 🏓' });

    const bot = Math.round(this.client.ws.ping);
    const api = msg.createdTimestamp - message.createdTimestamp;
    const embed = this.embed(message)
      .setTitle('Pong! 🏓')
      .setDescription(`Bot Latency - ${bot}ms. API Latency - ${api}ms.`);

    return msg.edit({ embeds: [embed] });
  }
}
