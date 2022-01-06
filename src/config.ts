import type { ClientOptions } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types';
import { cleanEnv, str } from 'envalid';
import process from 'node:process';

export const env = cleanEnv(process.env, {
	TOKEN: str({ desc: 'The discord bot token' })
});

export const clientOptions: ClientOptions = {
	// Intents dictate what events the client will receive.
	intents: GatewayIntentBits.Guilds
};
