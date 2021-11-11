import { URL } from 'node:url';

export const rootURL = new URL('../package.json', import.meta.url);
