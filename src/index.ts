import '@sapphire/plugin-logger/register';
import 'dotenv/config';

import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior, Piece, container } from '@sapphire/framework';
import { clientOptions, env } from '#root/config';
import process from 'node:process';

const client = new SapphireClient(clientOptions);

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

// Utility - saves a lot of characters. A lot.
Object.defineProperty(Piece.prototype, 'client', { get: () => container.client });

try {
	await client.login(env.TOKEN);
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
