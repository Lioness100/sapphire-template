import '@sapphire/plugin-logger/register';
import 'dotenv/config';

import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior, Piece, container } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { clientOptions } from '#root/config';
import process from 'node:process';

const client = new SapphireClient(clientOptions);

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

// This reply is overridden for a much less passive aggressive tone.
PaginatedMessage.wrongUserInteractionReply = (user) => `❌ Only ${user} can use these buttons!`;

// Utility - saves a lot of characters. A lot.
Object.defineProperty(Piece.prototype, 'client', { get: () => container.client });

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	client.destroy();

	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
