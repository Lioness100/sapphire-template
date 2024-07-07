import {
	type ListenerErrorPayload,
	Listener,
	Events,
	type ChatInputCommandErrorPayload,
	type ContextMenuCommandErrorPayload,
	type InteractionHandlerError,
	type InteractionHandlerParseError,
	type AutocompleteInteractionPayload,
	type Command
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { logPieceError } from '#utils/logging';

@ApplyOptions<Listener.Options>({ name: Events.Error })
export class ErrorListener extends Listener<typeof Events.Error> {
	public override run(error: Error) {
		this.container.logger.error(error);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ListenerError })
export class ListenerErrorListener extends Listener<typeof Events.ListenerError> {
	public override run(error: Error, { piece }: ListenerErrorPayload) {
		logPieceError(error, piece);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.CommandAutocompleteInteractionError })
export class CommandAutocompleteInteractionErrorListener extends Listener<
	typeof Events.CommandAutocompleteInteractionError
> {
	public override run(error: Error, { command }: AutocompleteInteractionPayload) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.CommandApplicationCommandRegistryError })
export class CommandApplicationCommandRegistryErrorListener extends Listener<
	typeof Events.CommandApplicationCommandRegistryError
> {
	public override run(error: Error, command: Command) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ChatInputCommandError })
export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public override run(error: Error, { command }: ChatInputCommandErrorPayload) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ContextMenuCommandError })
export class ContextMenuErrorListener extends Listener<typeof Events.ContextMenuCommandError> {
	public override run(error: Error, { command }: ContextMenuCommandErrorPayload) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.InteractionHandlerError })
export class InteractionHandlerErrorListener extends Listener<typeof Events.InteractionHandlerError> {
	public override run(error: Error, { handler }: InteractionHandlerError) {
		logPieceError(error, handler);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.InteractionHandlerParseError })
export class InteractionHandlerParseErrorListener extends Listener<typeof Events.InteractionHandlerParseError> {
	public override run(error: Error, { handler }: InteractionHandlerParseError) {
		logPieceError(error, handler);
	}
}
