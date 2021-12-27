import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

// Discord slash command permissions are in the process of a overhaul, but
// currently, it's just easier to use preconditions. As of now, there are no
// "global" slash command permissions, which means, to restrict a command to a
// specific user, you must restrict it in *every* single guild the bot is in.
export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!this.container.client.application!.owner) {
			await this.container.client.application!.fetch();
		}

		return this.container.client.application!.owner?.id === interaction.user.id
			? this.ok()
			: this.error({ message: 'This command can only be used by my owner' });
	}
}
