import { isFunction } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { Structures, MessageEmbed } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type EmbedModifyFunction = <T extends MessageEmbed>(embed: T) => void | T;

class CustomMessage extends Structures.get('Message') {
  public embed(title: string, fn: EmbedModifyFunction | true): Promise<Message>;
  public embed(title: string, fn?: false): MessageEmbed;
  public embed(title: string, fn?: EmbedModifyFunction | boolean): Promise<Message> | MessageEmbed {
    const embed = new MessageEmbed({
      title,
      color: process.env.COLOR,
    });

    if (fn) {
      if (isFunction(fn)) {
        fn(embed);
      }
      return this.channel.send(embed);
    }

    return embed;
  }

  public error(title: string, desc?: string, modifyFn?: EmbedModifyFunction): Promise<Message> {
    return this.embed(`❌ ${title}`, (embed) => {
      desc && embed.setColor('RED').setDescription(desc);
      modifyFn?.(embed);
    });
  }
}

declare module 'discord.js' {
  export interface Message {
    embed(title: string, fn: EmbedModifyFunction | true): Promise<Message>;
    embed(title: string, fn?: false): MessageEmbed;
    embed(title: string, fn?: EmbedModifyFunction | boolean): Promise<Message> | MessageEmbed;
    error(title: string, desc?: string, modifyFn?: EmbedModifyFunction): Promise<Message>;
  }
}

Structures.extend('Message', () => CustomMessage);
