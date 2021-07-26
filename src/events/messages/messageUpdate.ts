import { Event, Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserEvent extends Event {
  public run(old: Message, message: Message) {
    if (old.content === message.content) {
      return;
    }

    if (message.webhookID !== null) {
      return;
    }

    if (message.system || message.author.bot) {
      return;
    }

    this.context.client.emit(Events.PreMessageParsed, message);
  }
}
