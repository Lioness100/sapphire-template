import { blue, green, magenta, magentaBright, bold } from 'colorette';
import { Listener, type Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { env } from '#root/config';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyListener extends Listener<typeof Events.ClientReady> {
	public run() {
		const stores = this.container.stores
			.filter((store) => store.size)
			.map((store) => {
				const titleCase = store.name.replace('-', ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase());
				return `  [${blue(store.size)}] ${titleCase}`;
			})
			.join('\n');

		console.log(String.raw`
		${bold('Discord Bot')}

  [${green('+')}] Gateway
${stores}
  ${magenta('<')}${magentaBright('/')}${magenta('>')} ${bold(`${env.isProduction ? 'PROD' : 'DEV'} MODE`)}
`);
	}
}
