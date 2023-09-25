import type { ChatInputCommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

export class OwnerOnlyPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		if (!this.container.client.application!.owner) {
			await this.container.client.application!.fetch();
		}

		return this.container.client.application!.owner!.id === interaction.user.id
			? this.ok()
			: this.error({ message: 'This command can only be used by my owner' });
	}
}
