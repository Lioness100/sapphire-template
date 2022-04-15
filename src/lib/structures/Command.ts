import { Command as SapphireCommand, type Args, type Piece } from '@sapphire/framework';
import { env } from '#root/config';

export abstract class Command<O extends Command.Options = Command.Options> extends SapphireCommand<Args, O> {
	public constructor(context: Piece.Context, options: O) {
		super(context, options);

		// If this command is owner only:
		if (this.category === 'dev') {
			// Enable it only if there is a development server on the assumption it would've been registered guild wide
			// otherwise.
			this.enabled &&= Boolean(env.DEV_SERVER_ID);

			// Automatically enable the OwnerOnly precondition.
			this.preconditions.append('OwnerOnly');
		}
	}
}

export namespace Command {
	// Convenience type to save imports.
	export type Options = SapphireCommand.Options;
}
