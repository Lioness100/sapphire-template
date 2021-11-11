import type { CommandContext } from '@sapphire/framework';
import { UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';

export const getPrefix = (context: CommandContext) => {
	return UserOrMemberMentionRegex.test(context.commandPrefix) ? `@${container.client.user!.username} ` : context.commandPrefix;
};
