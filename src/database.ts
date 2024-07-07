// eslint-disable-next-line import/no-unresolved
import { JSONFilePreset } from 'lowdb/node';

interface Settings {
	test?: boolean;
}

export const db = await JSONFilePreset<Settings>('data/db.json', {});
