import type { Message } from 'discord.js';
import { Precondition } from '@sapphire/framework';

export default class UserPrecondition extends Precondition {
  public async run(message: Message) {
    if (!this.container.client.application!.owner) {
      await this.container.client.application!.fetch();
    }

    return this.container.client.application!.owner?.id === message.author.id
      ? this.ok()
      : this.error({ message: 'This command can only be used by my owner.' });
  }
}
