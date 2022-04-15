import type { CacheType } from 'discord.js';
import { Command as SapphireCommand, type ChatInputCommand, type Piece } from '@sapphire/framework';
import { env } from '#root/config';

export abstract class Command extends SapphireCommand {
	public constructor(context: Piece.Context, options: ChatInputCommand.Options) {
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

	// This is already present Command, but is marked as optional.
	public abstract override chatInputRun(interaction: ChatInputCommand.Interaction, context: ChatInputCommand.RunContext): unknown;
}

export namespace Command {
	// Convenience type to save imports.
	export type Options = ChatInputCommand.Options;
	export type Interaction<Cache extends CacheType = CacheType> = ChatInputCommand.Interaction<Cache>;
	export type Registry = ChatInputCommand.Registry;
}
