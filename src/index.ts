import 'dotenv/config';

import { SapphireClient, Piece, container } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { clientOptions } from '#root/config';

const client = new SapphireClient(clientOptions);

// This reply is overridden for a much less passive aggressive tone.
PaginatedMessage.wrongUserInteractionReply = (user) => `❌ Only ${user} can interact with this message!`;

// Utility - saves a lot of characters.
Object.defineProperty(Piece.prototype, 'client', { get: () => container.client });

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
