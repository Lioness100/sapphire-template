import type { CommandContext } from '@sapphire/framework';
import { UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';

/**
 * Get the formatted prefix used with a command. When prefixes are displayed, it is usually in an inline
 * code block. However, if the bot triggered a command via mention, the code block would then show `<@...id>`.
 * This utility will detect if the prefix was a mention, and replace it with something more readable.
 */
export const getPrefix = (context: CommandContext) => {
	return UserOrMemberMentionRegex.test(context.commandPrefix) ? `@${container.client.user!.username} ` : context.commandPrefix;
};
