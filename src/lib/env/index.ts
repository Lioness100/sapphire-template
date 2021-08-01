/* eslint-disable @typescript-eslint/no-namespace */
import { bold, red } from 'colorette';
import { isNullishOrEmpty } from '@sapphire/utilities';
import type { ActivityType } from 'discord.js';
import { Util } from 'discord.js';

const TokenRegex = /^[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/;

export default interface IProcessEnv {
  TOKEN: string;
  PREFIX: string;
  COLOR: string;
  PRESENCE_NAME: string;
  PRESENCE_TYPE: ActivityType;
}

/**
 * check if the local env has a value and optionally validate it
 * @param key - the key to check
 * @param [validate] - an optional validator to make sure everything runs smoothly
 */
const has = (key: keyof IProcessEnv, validate?: (value: string) => unknown, required = true) => {
  const value = process.env[key];
  if (required && isNullishOrEmpty(value)) {
    console.error(bold(red(`"${key}" in .env is required, but is empty or undefined`)));
    process.exit(1);
  }
  if (value && validate) {
    const error = validate(value);
    if (typeof error === 'string') {
      console.error(bold(red(`"${key}" in .env ${error}`)));
      process.exit(1);
    }
  }
};

const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;
const types = ['PLAYING', 'LISTENING', 'WATCHING', 'COMPETING'];

has('PREFIX');
has('TOKEN', (val) => !TokenRegex.test(val) && 'is not a valid token');
has('COLOR', (val) => !Util.resolveColor(val) && 'is not a valid color');
has('PRESENCE_NAME', (val) => val && !type && 'must be coupled with "BOT_PRESENCE_TYPE"', false);
has('PRESENCE_TYPE', (val) => val && !name && 'must be coupled with "BOT_PRESENCE_NAME"', false);
has('PRESENCE_TYPE', (val) => !types.includes(val) && `must be one of ${types.join(', ')}`, false);
