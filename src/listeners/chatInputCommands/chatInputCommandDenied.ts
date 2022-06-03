import { Listener, UserError, type Events, type ChatInputCommandDeniedPayload } from '@sapphire/framework';
import { sendError } from '#utils/responses';

export class ChatInputCommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if ((error.context as { silent?: true })?.silent) {
			return;
		}

		return sendError(interaction, error.message, { prefix: '🚫 ' });
	}
}
