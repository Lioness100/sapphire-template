import type { ClientOptions } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types/v9';
import { cleanEnv, str } from 'envalid';
import { LogLevel } from '@sapphire/framework';
import process from 'node:process';

// Unless explicitly defined, set NODE_ENV to development.
process.env.NODE_ENV ??= 'development';

export const env = cleanEnv(process.env, {
	DISCORD_TOKEN: str({ desc: 'The discord bot token' }),
	DEV_SERVER_ID: str({ default: '' })
});

export const clientOptions: ClientOptions = {
	// Intents dictate what events the client will receive.
	intents: GatewayIntentBits.Guilds,
	logger: { level: env.isProduction ? LogLevel.Info : LogLevel.Debug },
	loadDefaultErrorListeners: false
};
