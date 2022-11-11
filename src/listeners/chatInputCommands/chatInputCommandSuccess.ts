import { Listener, type Events, type ChatInputCommandSuccessPayload } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { bold, cyan } from 'colorette';
import { env } from '#root/config';

@ApplyOptions({ enabled: env.isDev })
export class ChatInputCommandSuccessListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override run({ interaction, command }: ChatInputCommandSuccessPayload) {
		const nameDisplay = cyan(bold(`[commands/${command.name}]`));
		this.container.logger.debug(`${nameDisplay} - Executed by ${interaction.user.tag} (${interaction.user.id})`);
	}
}
