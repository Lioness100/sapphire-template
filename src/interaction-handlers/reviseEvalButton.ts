import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { userMention, type ButtonInteraction } from 'discord.js';
import { CustomId, parseCustomId } from '#utils/customIds';
import { sendError } from '#utils/responses';
import { EvalCommand } from '#root/commands/dev/eval';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class ReviseEvalButtonHandler extends InteractionHandler {
	public async run(
		interaction: ButtonInteraction,
		[, [userId, async, depth, ephemeral]]: InteractionHandler.ParseResult<this>
	) {
		if (interaction.user.id !== userId) {
			return sendError(interaction, `This button is only for ${userMention(userId)}`, { prefix: '🚫' });
		}

		const code = interaction.message.embeds[0].description?.slice('```js\n'.length, -'```'.length) ?? '';
		await EvalCommand.sendForm(interaction, { async, depth, ephemeral, code });
	}

	public override parse(interaction: ButtonInteraction) {
		return parseCustomId(interaction.customId, { filter: [CustomId.ReviseCodeButton] });
	}
}
