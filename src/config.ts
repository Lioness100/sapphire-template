/* eslint-disable @typescript-eslint/naming-convention */
import 'dotenv/config';

import { type ClientOptions, GatewayIntentBits } from 'discord.js';
import { cleanEnv, str } from 'envalid';
import { Logger } from '#structures/Logger';

process.env.TZ = 'America/New_York';
process.env.NODE_ENV ??= 'development';

export const env = cleanEnv(process.env, {
	DISCORD_TOKEN: str({ desc: 'The discord bot token' }),
	DEV_SERVER_ID: str({ default: '' })
});

export const clientOptions: ClientOptions = {
	intents: [GatewayIntentBits.Guilds],
	logger: { instance: new Logger() },
	loadDefaultErrorListeners: false,
	hmr: { enabled: env.isDev }
};
