import { Event } from '@sapphire/framework';
import type { Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class UserEvent extends Event<Events.MentionPrefixOnly> {
  public run(message: Message) {
    void message.embed(`My prefix is \`${process.env.PREFIX}\``, (embed) => {
      if (!message.guild) {
        embed.setFooter("TIP: you don't need a prefix in DMs!");
      }
    });
  }
}
