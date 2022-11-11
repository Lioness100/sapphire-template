import { Listener, type Events, type ListenerErrorPayload } from '@sapphire/framework';
import { Logger } from '#structures/Logger';

export class ListenerErrorListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, { piece }: ListenerErrorPayload) {
		Logger.reportPieceError(error, piece);
	}
}
