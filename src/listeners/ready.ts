import type { ListenerOptions, Piece, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, bold } from 'colorette';
import { Listener, Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { readFileSync } from 'fs';

@ApplyOptions<ListenerOptions>({ once: true })
export default class UserEvent extends Listener<typeof Events.ClientReady> {
  public run() {
    this.printBanner();
    this.printStoreDebugInformation();
  }

  private printBanner() {
    const { version, name }: Record<string, string> = JSON.parse(
      readFileSync('./package.json').toString()
    );

    this.container.logger.info(
      `

${magenta(version)}
[${green('+')}] Gateway
${magenta('<')}${magentaBright('/')}${magenta('>')} ${bold(name)}

${this.printStoreDebugInformation()}
`
    );
  }

  private printStoreDebugInformation() {
    const stores = [...this.container.client.stores.values()];
    return stores
      .reverse()
      .reduce(
        (list, store) => `${this.styleStore(store, false)}\n${list}`,
        this.styleStore(stores.pop()!, true)
      );
  }

  private styleStore(store: Store<Piece>, last: boolean) {
    return gray(
      `${last ? '└─' : '├─'} Loaded ${blue(store.size.toString().padEnd(3, ' '))} ${store.name}`
    );
  }
}
