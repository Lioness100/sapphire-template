import type { Message, Guild, GuildMember, TextChannel } from 'discord.js';

export default interface GuildMessage extends Message {
  channel: TextChannel;
  readonly member: GuildMember;
  readonly guild: Guild;
}
