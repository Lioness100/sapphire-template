import { Util } from 'discord.js';
import has from '#lib/env/validate';

const tokenRegex = /^[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}$/;

const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;
const types = ['PLAYING', 'LISTENING', 'WATCHING', 'COMPETING'];

has('PREFIX');
has('TOKEN', (val) => tokenRegex.test(val) || 'is not a valid token');
has('COLOR', (val) => Util.resolveColor(val) || 'is not a valid color');
has('PRESENCE_NAME', (val) => val && !type && 'must be coupled with "PRESENCE_TYPE"', false);
has('PRESENCE_TYPE', (val) => val && !name && 'must be coupled with "PRESENCE_NAME"', false);
has('PRESENCE_TYPE', (val) => types.includes(val) || `must be one of ${types.join(', ')}`, false);
