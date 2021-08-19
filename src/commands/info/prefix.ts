import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({
  aliases: ['p'],
  description: 'View my prefix',
})
export class UserCommand extends Command {
  public run(message: Message) {
    return this.container.client.emit('mentionPrefixOnly', message);
  }
}
