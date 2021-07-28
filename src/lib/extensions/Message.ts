import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { isFunction, isObject } from '@sapphire/utilities';
import type { Message, MessageEmbedOptions } from 'discord.js';
import { Structures, MessageEmbed, Util } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type EmbedModifier = (<T extends MessageEmbed>(embed: T) => void | T) | MessageEmbedOptions;

class CustomMessage extends Structures.get('Message') {
  /**
   * send a base embed with the branding color and author displayed (if in guilds)
   * @param [desc] - the description for the embed
   * @param [mod] - the embed modifier
   * @example
   * message.embed().setTitle('hello');
   * message.embed('hello');
   * message.embed('hello', true);
   * message.embed('hello', { title: 'hello' });
   * message.embed('hello', (embed) => embed.setTitle('hello'));
   */
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

      return this.send(embed);
    }

    return embed;
  }

  /**
   * internally calls {@link CustomMessage#embed} but sets the color red and appends "❌ "
   * @param desc - the error description
   * @param [mod] - the embed modifier
   * @example
   * message.error('nope');
   * message.embed('nope', { title: 'nope' });
   * message.embed('nope', (embed) => embed.setTitle('nope'));
   */
  public error(desc: string, mod?: EmbedModifier): Promise<Message> {
    const color = Util.resolveColor('RED');

    return this.embed(
      `❌ ${desc}`,
      mod
        ? isFunction(mod)
          ? (embed) => {
              embed.setColor('RED');
              mod(embed);
            }
          : { color, ...mod }
        : { color }
    );
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
