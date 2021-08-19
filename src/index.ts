import '#root/setup';
import { container } from '@sapphire/framework';
import { MikroORM } from '@mikro-orm/core';
import { yellow, green, bold } from 'colorette';
import Client from '#structures/Client';
import Guild from '#entities/Guild';
import ormOptions from '#config/orm';

const client = new Client();

try {
  client.logger.info(yellow('Logging in'));
  await client.login(process.env.TOKEN);
  client.logger.info(bold(green('Logged in')));

  client.logger.info(yellow('Connecting to database'));
  const { em } = await MikroORM.init(ormOptions);
  client.logger.info(bold(green('Connected')));

  container.em = em;
  container.guilds = em.getRepository(Guild);
} catch (error) {
  client.logger.fatal(error);
  client.destroy();
  process.exit(1);
}
