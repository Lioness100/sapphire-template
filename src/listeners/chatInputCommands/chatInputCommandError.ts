import { Listener, UserError, type Events, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { red, bold } from 'colorette';
import { sendError } from '#utils/responses';

export class UserEvent extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, { command, interaction }: ChatInputCommandErrorPayload) {
		if (error instanceof UserError) {
			return sendError(interaction, error.message);
		}

		this.container.logger.fatal(`${red(bold(`[/${command.name}]`))} ${error.stack || error.message}`);
		return sendError(interaction, 'Something went wrong');
	}
}
