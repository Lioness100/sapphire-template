import {
	type ListenerErrorPayload,
	Listener,
	Events,
	type ChatInputCommandErrorPayload,
	type ContextMenuCommandErrorPayload,
	type InteractionHandlerError,
	type InteractionHandlerParseError,
	type AutocompleteInteractionPayload
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { RepliableInteraction } from 'discord.js';
import { logPieceError, reportPieceError } from '#utils/logging';
import type { Command } from '#structures/Command';

@ApplyOptions<Listener.Options>({ name: Events.Error })
export class ErrorListener extends Listener<typeof Events.Error> {
	public override run(error: Error) {
		this.container.logger.error(error);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ListenerError })
export class ListenerErrorListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, { piece }: ListenerErrorPayload) {
		logPieceError(error, piece);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.CommandAutocompleteInteractionError })
export class CommandAutocompleteInteractionErrorListener extends Listener<
	typeof Events.CommandAutocompleteInteractionError
> {
	public run(error: Error, { command }: AutocompleteInteractionPayload) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.CommandApplicationCommandRegistryError })
export class CommandApplicationCommandRegistryErrorListener extends Listener<
	typeof Events.CommandApplicationCommandRegistryError
> {
	public run(error: Error, command: Command) {
		logPieceError(error, command);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ChatInputCommandError })
export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, { command, interaction }: ChatInputCommandErrorPayload) {
		return reportPieceError(error, command, interaction);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ContextMenuCommandError })
export class ContextMenuErrorListener extends Listener<typeof Events.ContextMenuCommandError> {
	public run(error: Error, { command, interaction }: ContextMenuCommandErrorPayload) {
		return reportPieceError(error, command, interaction as RepliableInteraction);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.InteractionHandlerError })
export class InteractionHandlerErrorListener extends Listener<typeof Events.InteractionHandlerError> {
	public run(error: Error, { handler, interaction }: InteractionHandlerError) {
		return reportPieceError(error, handler, interaction as RepliableInteraction);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.InteractionHandlerParseError })
export class InteractionHandlerParseErrorListener extends Listener<typeof Events.InteractionHandlerParseError> {
	public run(error: Error, { handler, interaction }: InteractionHandlerParseError) {
		return reportPieceError(error, handler, interaction as RepliableInteraction);
	}
}
