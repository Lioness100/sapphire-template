/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { Message, MessageEmbedOptions } from 'discord.js';
import type { Awaited } from '@sapphire/utilities';
import { MessageEmbed, Util } from 'discord.js';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { isFunction, isObject, isThenable } from '@sapphire/utilities';
import { send } from '@sapphire/plugin-editable-commands';

type EmbedModifier =
  | (<T extends MessageEmbed>(embed: T) => Awaited<void | T>)
  | MessageEmbedOptions;

interface EmbedOverload {
  (message: Message, desc: string, mod: EmbedModifier | true): Promise<Message>;
  (message: Message, desc?: string, mod?: false): MessageEmbed;
}

export const embed = ((
  message: Message,
  desc?: string,
  mod?: EmbedModifier | boolean
): Promise<Message> | MessageEmbed => {
  const embed = new MessageEmbed({
    description: desc,
    color: process.env.COLOR,
  });

  if (isGuildBasedChannel(message.channel)) {
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }));
  }

  if (mod) {
    let promise;
    if (isFunction(mod)) {
      promise = mod(embed);
    } else if (isObject(mod)) {
      Object.assign(embed, mod);
    }

    const sent = send(message, { embeds: [embed] });

    if (isThenable(promise)) {
      return promise.then(() => sent);
    }

    return sent;
  }

  return embed;
}) as EmbedOverload;

export const error = (message: Message, desc: string, mod?: EmbedModifier): Promise<Message> => {
  const color = Util.resolveColor('RED');

  return embed(
    message,
    `❌ ${desc}!`,
    mod
      ? isFunction(mod)
        ? (embed) => {
            embed.setColor('RED');
            return mod(embed);
          }
        : { color, ...mod }
      : { color }
  );
};
