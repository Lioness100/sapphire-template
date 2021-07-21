import { Event } from '@sapphire/framework';
import type { Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Event<Events.MentionPrefixOnly> {
  public run(message: Message) {
    console.log('test');
    void message.embed('', (embed) =>
      embed.setDescription(`My prefix is \`${process.env.PREFIX}\``)
    );
  }
}
