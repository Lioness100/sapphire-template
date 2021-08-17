import type { Message } from 'discord.js';
import { Listener, Events } from '@sapphire/framework';
import { isDMChannel } from '@sapphire/discord.js-utilities';

export default class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
  public run(message: Message) {
    void this.container.embed(message, `My prefix is \`${process.env.PREFIX}\``, (embed) => {
      if (isDMChannel(message.channel)) {
        embed.setFooter("TIP: you don't need a prefix in DMs!");
      }
    });
  }
}
