import { CommandInteraction, Team } from 'discord.js';
import { Precondition } from '@sapphire/framework';

export class OwnerOnlyPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		const owner = this.client.application!.owner ?? (await this.client.application!.fetch()).owner!;

		// It will be a (partial) user or a team, and if it's a team, we should allow access to every member.
		return (owner instanceof Team ? owner.members.has(interaction.user.id) : interaction.user.id === owner!.id)
			? this.ok()
			: this.error({ message: 'This command can only be used by my owner' });
	}
}
