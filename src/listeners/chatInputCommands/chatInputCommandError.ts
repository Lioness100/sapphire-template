import { Listener, UserError, type Events, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { sendError } from '#utils/responses';
import { Logger } from '#structures/Logger';

export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, { command, interaction }: ChatInputCommandErrorPayload) {
		if (error instanceof UserError) {
			return sendError(interaction, error.message);
		}

		Logger.reportPieceError(error, command);
		return sendError(interaction, 'Something went wrong');
	}
}
