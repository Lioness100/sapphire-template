import '#env';
import '#ext';
import '@skyra/editable-commands';
import { SapphireClient } from '@sapphire/framework';
import { yellow, green, bold } from 'colorette';
import config from '#root/config';

const client = new SapphireClient(config);

try {
  client.logger.info(yellow('Logging in'));
  await client.login(process.env.TOKEN);
  client.logger.info(bold(green('Logged in')));
} catch (error) {
  client.logger.fatal(error);
  client.destroy();
  process.exit(1);
}
