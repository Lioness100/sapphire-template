import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';

@ApplyOptions<CommandOptions>({
  description: 'Shows my latency',
  detailedDescription: [
    'Shows the bot latency (the ping of the websocket)',
    'and the API latency (how quickly I can communicate with Discord)',
  ].join(' '),
})
export class UserCommand extends Command {
  public async run(message: Message) {
    const msg = await message.embed('', { title: 'Ping?' });
    const embed = message
      .embed()
      .setTitle('Pong!')
      .setDescription(
        `Bot Latency - ${Math.round(this.context.client.ws.ping)}ms. API Latency - ${
          msg.createdTimestamp - message.createdTimestamp
        }ms.`
      );

    return msg.edit(embed);
  }
}
