import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({
  description: 'ping pong',
})
export class UserCommand extends Command {
  public async run(message: Message) {
    const msg = await message.embed('Ping?', true);
    const embed = message
      .embed('Pong! 🏓')
      .setDescription(
        `Bot Latency - ${Math.round(this.context.client.ws.ping)}ms. API Latency - ${
          msg.createdTimestamp - message.createdTimestamp
        }ms.`
      );

    return msg.edit(embed);
  }
}
