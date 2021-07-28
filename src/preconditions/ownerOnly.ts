import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class UserPrecondition extends Precondition {
  private owner?: string;

  public onLoad() {
    const setOwner = async () => {
      const application = await this.context.client.fetchApplication();
      this.owner = application.owner?.id;
    };

    if (this.context.client.readyTimestamp) {
      void setOwner();
    } else {
      this.context.client.once('ready', () => {
        void setOwner();
      });
    }
  }

  public run(message: Message) {
    return this.owner === message.author.id
      ? this.ok()
      : this.error({ message: 'This command can only be used by the owner.' });
  }
}
