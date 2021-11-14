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
		// in dms, a prefix isn't required
		return [prefix, ''];
	}

	return prefix;
};

export const config: SapphireClientOptions & ClientOptions = {
	// don't mention @everyone
	allowedMentions: { parse: ['users', 'roles'] },
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,

	// trace loggings clutter the console, and should only be used when debugging @sapphire/pieces specifically
	enableLoaderTraceLoggings: false,
	fetchPrefix,

	// we create our own custom error listeners
	loadDefaultErrorListeners: false,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,

	// `Constants.PartialTypes.CHANNEL` partial is required to receive direct messages
	partials: [Constants.PartialTypes.CHANNEL],

	// only input a present if both `name` and `type` are present
	presence: name && type ? { activities: [{ name, type }] } : undefined
};
