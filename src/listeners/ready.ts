import { blue, green, magenta, magentaBright, bold } from 'colorette';
import { Listener, type Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { env } from '#root/config';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public run() {
		const usedStores = this.container.stores.filter((store) => store.size).sorted((a, b) => a.size - b.size);
		const storesDisplay = usedStores
			.map((store) => `  [${blue(store.size)}] ${toTitleCase(store.name.replace('-', ' '))}`)
			.join('\n');

		console.log(String.raw`
		${bold('Sapphire Template')}

  [${green('+')}] Gateway
${storesDisplay}
  ${magenta('<')}${magentaBright('/')}${magenta('>')} ${bold(`${env.isProduction ? 'PROD' : 'DEV'} MODE`)}
`);
	}
}
