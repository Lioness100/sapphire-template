import type { Message } from 'discord.js';
import { Listener, Events } from '@sapphire/framework';
import { isDMChannel } from '@sapphire/discord.js-utilities';

export default class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
  public async run(message: Message) {
    const guildPrefix =
      message.guild &&
      (await this.container.guilds.findOne(message.guild.id, { fields: ['prefix'] }));

    void this.container.embed(
      message,
      `My prefix ${guildPrefix ? 'in this guild ' : ''}is \`${
        guildPrefix?.prefix ?? process.env.PREFIX
      }\``,
      (embed) => {
        if (isDMChannel(message.channel)) {
          embed.setFooter("TIP: you don't need a prefix in DMs!");
        }
      }
    );
  }
}
