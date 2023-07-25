import '@sapphire/plugin-hmr/register';

import { SapphireClient, Piece, container, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { clientOptions, env } from '#root/config';

process.env.TZ = 'America/New_York';

const client = new SapphireClient(clientOptions);

// This reply is overridden for a much less passive aggressive tone.
PaginatedMessage.wrongUserInteractionReply = (user) => `❌ Only ${user} can interact with this message!`;

if (env.isDev) {
	ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
}

// Utility - saves a lot of characters.
Object.defineProperty(Piece.prototype, 'client', { get: () => container.client });

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
