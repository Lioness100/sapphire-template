import { Listener } from '@sapphire/framework';

export class ErrorListener extends Listener {
	public override run(error: Error) {
		this.container.logger.error(error);
	}
}
