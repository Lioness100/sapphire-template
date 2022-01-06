import '@sapphire/plugin-logger/register';
import 'dotenv/config';

import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior, Piece, container } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord-api-types/v9';
import { Constants } from 'discord.js';
import { config } from '#root/config';
import process from 'node:process';

const client = new SapphireClient({
	// Trace loggings clutter the console, and should only be used when debugging @sapphire/pieces specifically.
	enableLoaderTraceLoggings: false,

	// Intents dictate what events the client will receive.
	intents: GatewayIntentBits.Guilds,

	// `Constants.PartialTypes.CHANNEL` partial is required to receive direct messages.
	partials: [Constants.PartialTypes.CHANNEL]
});

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

// Utility - saves a lot of characters. A lot.
Object.defineProperty(Piece.prototype, 'client', { get: () => container.client });

try {
	await client.login(config.TOKEN);
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
