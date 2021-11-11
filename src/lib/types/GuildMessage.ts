import type { Message, Guild, GuildMember, TextChannel } from 'discord.js';

export default interface GuildMessage<Cached extends boolean = boolean> extends Message<Cached> {
	channel: TextChannel;
	readonly member: GuildMember;
	readonly guild: Guild;
}
