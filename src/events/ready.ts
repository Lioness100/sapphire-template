import type { EventOptions, Events, Piece, Store } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { blue, gray, green, magenta, magentaBright, bold } from 'colorette';
import { readFileSync } from 'fs';

@ApplyOptions<EventOptions>({ once: true })
export default class UserEvent extends Event<Events.Ready> {
  public run() {
    this.printBanner();
    this.printStoreDebugInformation();
  }

  /**
   * print a colorful banner with the version and name
   */
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

  /**
   * print how many pieces are in each store colorfully
   */
  private printStoreDebugInformation() {
    const { client, logger } = this.context;
    const stores = [...client.stores.values()];
    const last = stores.pop()!;

    for (const store of stores) {
      logger.info(this.styleStore(store, false));
    }
    logger.info(this.styleStore(last, true));
  }

  /**
   * style how the {@link UserEvent#printStoreDebugInformation} is displayed
   */
  private styleStore(store: Store<Piece>, last: boolean) {
    return gray(
      `${last ? '└─' : '├─'} Loaded ${blue(store.size.toString().padEnd(3, ' '))} ${store.name}`
    );
  }
}
