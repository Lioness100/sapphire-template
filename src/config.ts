import type { SapphireClientOptions } from '@sapphire/framework';
import { LogLevel } from '@sapphire/framework';
import type { ClientOptions } from 'discord.js';

const prefix = process.env.PREFIX;
const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;

const options: SapphireClientOptions & ClientOptions = {
  allowedMentions: { parse: ['users', 'roles'] },
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true,
  fetchPrefix: (message) => (message.guild ? prefix : [prefix, '']),
  loadDefaultErrorEvents: false,
  logger: {
    level: LogLevel.Trace,
  },
  messageCacheMaxSize: 25,
  ws: {
    intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
  },
};

if (name && type) {
  options.presence = { activity: { name, type } };
}

export default options;
