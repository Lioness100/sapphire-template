// eslint-disable-next-line import/no-unresolved
import '@sapphire/plugin-hmr/register';

import { SapphireClient, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { clientOptions, env } from '#root/config';

const client = new SapphireClient(clientOptions);

if (env.isDev) {
	ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
}

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	process.exit(1);
}
