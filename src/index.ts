// eslint-disable-next-line import/no-unresolved
import '@sapphire/plugin-hmr/register';

import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { clientOptions, env } from '#root/config';

const client = new SapphireClient(clientOptions);

// This reply is overridden for a much less passive aggressive tone.
PaginatedMessage.wrongUserInteractionReply = (user) => `❌ Only ${user} can interact with this message!`;

if (env.isDev) {
	ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
}

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	process.exit(1);
}
