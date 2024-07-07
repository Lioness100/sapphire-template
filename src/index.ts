// eslint-disable-next-line import/no-unresolved
import '@sapphire/plugin-hmr/register';

import {
	SapphireClient,
	ApplicationCommandRegistries,
	RegisterBehavior,
	ApplicationCommandRegistry
} from '@sapphire/framework';
import { clientOptions, env } from '#root/config';

const client = new SapphireClient(clientOptions);

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

if (env.isDev) {
	const target = 'registerChatInputCommand' as const;
	type Target = ApplicationCommandRegistry[typeof target];

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { registerChatInputCommand } = ApplicationCommandRegistry.prototype;
	Object.defineProperty(ApplicationCommandRegistry.prototype, target, {
		value(...[command, options]: Parameters<Target>) {
			return registerChatInputCommand.call(this, command, { guildIds: [env.DEV_SERVER_ID], ...options });
		}
	});
}

try {
	await client.login();
} catch (error) {
	client.logger.fatal(error);
	process.exit(1);
}
