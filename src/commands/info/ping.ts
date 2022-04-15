import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { createEmbed } from '#utils/responses';
import { inlineCode } from '@discordjs/builders';
import { EmbedColor } from '#utils/constants';
import { Command } from '#structures/Command';

@ApplyOptions<Command.Options>({
	description: 'View my latency',
	chatInputCommand: {
		register: true,
		idHints: ['919288852131217419']
	}
})
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.Interaction) {
		const embed = createEmbed('', EmbedColor.Secondary).setTitle('Ping? 🏓');
		const message = (await interaction.reply({ embeds: [embed], fetchReply: true })) as Message;

		const botLatency = Math.round(this.client.ws.ping);
		const apiLatency = message.createdTimestamp - message.createdTimestamp;

		const displays = [
			['Bot Latency', botLatency],
			['API Latency', apiLatency]
		].map(([name, value]) => `${name} ➡️ ${inlineCode(`${value.toString()}ms`)}`);

		const updatedEmbed = embed.setColor(EmbedColor.Primary).setTitle('Pong! 🏓').setDescription(displays.join('\n'));

		await interaction.editReply({ embeds: [updatedEmbed] });
	}
}
