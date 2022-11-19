import { LogLevel, type ILogger } from '@sapphire/framework';
import { Logger as TSLogger } from 'tslog';
import { env } from '#root/config';

export class Logger extends TSLogger implements ILogger {
	public has(level: LogLevel) {
		return level >= (env.isDev ? LogLevel.Debug : LogLevel.Info);
	}

	public write() {
		throw new Error('Not Implemented');
	}
}
