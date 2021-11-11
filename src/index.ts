import '#root/setup';
import { yellow, green, bold } from 'colorette';
import { SapphireClient } from '@sapphire/framework';
import { getEnv } from '#utils/env';
import config from '#root/config';

const client = new SapphireClient(config);

try {
	const token = getEnv('TOKEN').required().asString();

	client.logger.info(yellow('Logging in'));
	await client.login(token);
	client.logger.info(bold(green('Logged in')));
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
