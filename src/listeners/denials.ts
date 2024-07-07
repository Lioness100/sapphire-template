import {
	Listener,
	type UserError,
	Events,
	type ChatInputCommandDeniedPayload,
	type ContextMenuCommandDeniedPayload
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { RepliableInteraction } from 'discord.js';
import { reportPieceDenial } from '#utils/logging';

@ApplyOptions<Listener.Options>({ name: Events.ChatInputCommandDenied })
export class ChatInputCommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public override run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		return reportPieceDenial(error, interaction);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ContextMenuCommandDenied })
export class ContextMenuCommandDeniedListener extends Listener<typeof Events.ContextMenuCommandDenied> {
	public override run(error: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
		return reportPieceDenial(error, interaction as RepliableInteraction);
	}
}
