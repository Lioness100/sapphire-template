import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
  public run(message: Message) {
    return process.env.OWNER_ID === message.author.id
      ? this.ok()
      : this.error({ message: 'This command can only be used by the owner.' });
  }
}
