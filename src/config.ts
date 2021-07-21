import type { SapphireClientOptions } from '@sapphire/framework';
import { LogLevel } from '@sapphire/framework';
import type { ClientOptions } from 'discord.js';

const options: SapphireClientOptions & ClientOptions = {
  allowedMentions: { parse: ['users', 'roles'] },
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true,
  defaultPrefix: process.env.PREFIX,
  logger: {
    level: LogLevel.Trace,
  },
  messageCacheMaxSize: 0,
  messageEditHistoryMaxSize: 0,
  ws: {
    intents: ['GUILDS', 'GUILD_MESSAGES'],
  },
};

const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;

if (name && type) {
  options.presence = { activity: { name, type } };
}

export default options;
