import type { Events } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { Event } from '@sapphire/framework';

export default class extends Event<Events.MessageUpdate> {
  public run(old: Message, message: Message) {
    if (
      old.content === message.content ||
      message.webhookID !== null ||
      message.system ||
      message.author.bot
    ) {
      return;
    }

    this.context.client.emit('preMessageParsed', message);
  }
}
