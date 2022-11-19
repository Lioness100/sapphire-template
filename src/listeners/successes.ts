import {
	Listener,
	Events,
	type ChatInputCommandSuccessPayload,
	type ContextMenuCommandSuccessPayload
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Interaction } from 'discord.js';
import { env } from '#root/config';
import { logPieceSuccess } from '#utils/logging';

@ApplyOptions<Listener.Options>({ name: Events.ChatInputCommandSuccess, enabled: env.isDev })
export class ChatInputCommandSuccessListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override run({ interaction, command }: ChatInputCommandSuccessPayload) {
		logPieceSuccess(command, interaction);
	}
}

@ApplyOptions<Listener.Options>({ name: Events.ContextMenuCommandSuccess, enabled: env.isDev })
export class ContextMenuCommandSuccessListener extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public override run({ interaction, command }: ContextMenuCommandSuccessPayload) {
		logPieceSuccess(command, interaction as Interaction);
	}
}
