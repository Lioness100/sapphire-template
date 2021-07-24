/* eslint-disable @typescript-eslint/no-namespace */
import { bold, red } from 'colorette';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { Util } from 'discord.js';
import type { ActivityType, Snowflake } from 'discord.js';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';

const TokenRegex = /^[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/;

export default interface IProcessEnv {
  TOKEN: string;
  PREFIX: string;
  COLOR: string;
  PRESENCE_NAME: string;
  PRESENCE_TYPE: ActivityType;
  OWNER_ID: Snowflake;
}

const has = (key: keyof IProcessEnv, validate?: (value: string) => unknown, required = true) => {
  const value = process.env[key];
  if (required && isNullishOrEmpty(value)) {
    console.error(bold(red(`"${key}" in .env is required, but is empty or undefined`)));
    process.exit(1);
  }
  if (validate) {
    const error = validate(value);
    if (typeof error === 'string') {
      console.error(bold(red(`"${key}" in .env ${error}`)));
      process.exit(1);
    }
  }
};

const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;
const types = ['PLAYING', 'LISTENING', 'WATCHING'];

has('PREFIX');
has('TOKEN', (val) => !TokenRegex.test(val) && 'is not a valid token');
has('COLOR', (val) => !Util.resolveColor(val) && 'is not a valid color');
has('PRESENCE_NAME', (val) => val && !type && 'must be coupled with "BOT_PRESENCE_TYPE"', false);
has('PRESENCE_TYPE', (val) => val && !name && 'must be coupled with "BOT_PRESENCE_NAME"', false);
has('PRESENCE_TYPE', (val) => !types.includes(val) && `must be one of ${types.join(', ')}`, false);
has('OWNER_ID', (val) => !SnowflakeRegex.test(val) && 'is not a valid user ID');
