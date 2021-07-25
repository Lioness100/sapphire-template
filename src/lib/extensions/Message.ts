import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { isFunction, isObject } from '@sapphire/utilities';
import type { Message, MessageEmbedOptions } from 'discord.js';
import { Structures, MessageEmbed } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type EmbedModifier = (<T extends MessageEmbed>(embed: T) => void | T) | MessageEmbedOptions;

class CustomMessage extends Structures.get('Message') {
  public embed(desc: string, mod: EmbedModifier | true): Promise<Message>;
  public embed(desc?: string, mod?: false): MessageEmbed;
  public embed(desc?: string, mod?: EmbedModifier | boolean): Promise<Message> | MessageEmbed {
    const embed = new MessageEmbed({
      description: desc,
      color: process.env.COLOR,
    });

    if (isGuildBasedChannel(this.channel)) {
      embed.setAuthor(this.author.tag, this.author.displayAvatarURL({ dynamic: true }));
    }

    if (mod) {
      if (isFunction(mod)) {
        mod(embed);
      } else if (isObject(mod)) {
        Object.assign(embed, mod);
      }

      return this.channel.send(embed);
    }

    return embed;
  }

  public error(desc: string, mod?: EmbedModifier): Promise<Message> {
    return this.embed(`❌ ${desc}`, mod || true);
  }
}

declare module 'discord.js' {
  export interface Message {
    embed(desc: string, mod: EmbedModifier | true): Promise<Message>;
    embed(desc?: string, mod?: false): MessageEmbed;
    error(desc: string, mod?: EmbedModifier): Promise<Message>;
  }
}

Structures.extend('Message', () => CustomMessage);
