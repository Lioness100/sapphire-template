import type { EventOptions, Events, Piece } from '@sapphire/framework';
import { Event, Store } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { blue, gray, green, magenta, magentaBright, bold } from 'colorette';
import { readFileSync } from 'fs';

@ApplyOptions<EventOptions>({ once: true })
export default class UserEvent extends Event<Events.Ready> {
  public async run() {
    this.printBanner();
    this.printStoreDebugInformation();

    const application = await this.context.client.fetchApplication();
    Store.injectedContext.owner = application.owner?.id;
  }

  private printBanner() {
    const { version, name }: Record<string, string> = JSON.parse(
      readFileSync('./package.json').toString()
    );

    const success = green('+');

    const llc = magentaBright;
    const blc = magenta;
    const line = llc('');
    const pad = ' '.repeat(7);

    this.context.logger.info(
      String.raw`
${line} ${pad}
${line} ${pad}${blc(version)}
${line} ${pad}[${success}] Gateway
${line} ${pad}${blc('<')}${llc('/')}${blc('>')} ${bold(name)}
${line} ${pad}
		`.trim()
    );
  }

  private printStoreDebugInformation() {
    const { client, logger } = this.context;
    const stores = [...client.stores.values()];
    const last = stores.pop()!;

    for (const store of stores) {
      logger.info(this.styleStore(store, false));
    }
    logger.info(this.styleStore(last, true));
  }

  private styleStore(store: Store<Piece>, last: boolean) {
    return gray(
      `${last ? '└─' : '├─'} Loaded ${blue(store.size.toString().padEnd(3, ' '))} ${store.name}`
    );
  }
}
