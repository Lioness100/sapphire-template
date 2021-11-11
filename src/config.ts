import type { ClientOptions, ActivityOptions, Message } from 'discord.js';
import type { SapphireClientOptions } from '@sapphire/framework';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { GatewayIntentBits } from 'discord-api-types/v9';
import { Constants } from 'discord.js';
import { getEnv } from '#utils/env';

const prefix = getEnv('PREFIX').required().asString();
const name = getEnv('PRESENCE_NAME').asString();
const type = getEnv('PRESENCE_TYPE').asString() as ActivityOptions['type'];

const fetchPrefix = (message: Message) => {
	if (!isGuildBasedChannel(message.channel)) {
		return [prefix, ''];
	}

	return prefix;
};

const options: SapphireClientOptions & ClientOptions = {
	allowedMentions: { parse: ['users', 'roles'] },
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	enableLoaderTraceLoggings: false,
	fetchPrefix,
	loadDefaultErrorListeners: false,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
	partials: [Constants.PartialTypes.CHANNEL],
	presence: name && type ? { activities: [{ name, type }] } : undefined
};

export default options;
