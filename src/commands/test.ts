import { Command } from '@sapphire/framework';
import { sendSuccess } from '#utils/responses';

export class TestCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await sendSuccess(interaction, 'Command command ran');
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((command) =>
			command //
				.setName('test')
				.setDescription('test')
		);
	}
}
