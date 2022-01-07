import { Listener, type Events, type ListenerErrorPayload } from '@sapphire/framework';
import { bgRed, bold } from 'colorette';

export class UserEvent extends Listener<typeof Events.ListenerError> {
	public run(error: Error, { piece }: ListenerErrorPayload) {
		this.container.logger.fatal(`${bgRed(bold(`[/${piece.name}]`))} ${error.stack || error.message}`);
	}
}
