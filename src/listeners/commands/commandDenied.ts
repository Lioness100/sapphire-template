import type { Events, CommandDeniedPayload } from '@sapphire/framework';
import type { PermissionString } from 'discord.js';
import { Listener, Identifiers, UserError } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';

export default class UserEvent extends Listener<typeof Events.CommandDenied> {
	public run(error: UserError, { message, context }: CommandDeniedPayload) {
		if (Reflect.get(Object(error.context), 'silent')) {
			return;
		}

		if (
			error.identifier === Identifiers.PreconditionClientPermissions && //
			(context.missing as PermissionString[]).includes('EMBED_LINKS')
		) {
			return send(message, `❌ ${error.message.slice(0, -1)}!`);
		}

		return this.container.error(message, error.message);
	}
}
