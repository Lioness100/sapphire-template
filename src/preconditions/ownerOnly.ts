import { Precondition, Store } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class UserPrecondition extends Precondition {
  public run(message: Message) {
    return Store.injectedContext.owner === message.author.id
      ? this.ok()
      : this.error({ message: 'This command can only be used by the owner.' });
  }
}
