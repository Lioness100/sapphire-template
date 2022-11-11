import { readFile } from 'node:fs/promises';
import { blue, gray, green, magenta, magentaBright, bold } from 'colorette';
import { Listener, type Events, type Piece, type Store } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { env } from '#root/config';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public async run() {
		const raw = await readFile('../package.json', 'utf8');
		const { version } = JSON.parse(raw);

		this.container.logger.info(
			String.raw`

___________                   .__          __           __________        __
\__    ___/___   _____ ______ |  | _____ _/  |_  ____   \______   \ _____/  |_
  |    |_/ __ \ /     \\____ \|  | \__  \\   __\/ __ \   |    |  _//  _ \   __\
  |    |\  ___/|  Y Y  \  |_> >  |__/ __ \|  | \  ___/   |    |   (  <_> )  |
  |____| \___  >__|_|  /   __/|____(____  /__|  \___  >  |______  /\____/|__|
             \/      \/|__|             \/          \/          \/

  ${magenta(version)}
  [${green('+')}] Gateway
  ${magenta('<')}${magentaBright('/')}${magenta('>')} ${bold(`${env.isProduction ? 'PROD' : 'DEV'} MODE`)}

`
		);

		const stores = [...this.client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) {
			this.container.logger.info(this.styleStore(store));
		}

		this.container.logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<Piece>, last?: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${blue(store.size.toString().padEnd(3, ' '))} ${store.name}`);
	}
}
