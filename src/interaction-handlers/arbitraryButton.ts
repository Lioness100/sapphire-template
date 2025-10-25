import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';
import { CustomId, parseCustomId } from '#utils/customIds';
import { sendSuccess } from '#utils/responses';

@ApplyOptions<InteractionHandler.Options>({ interactionHandlerType: InteractionHandlerTypes.Button })
export class ArbitraryButtonInteractionHandler extends InteractionHandler {
	public override async run(
		interaction: ButtonInteraction<'cached'>,
		{ timestamp }: InteractionHandler.ParseResult<this>
	) {
		await sendSuccess(interaction, `You have clicked the arbitrary button with property timestamp: ${timestamp}`);
	}

	public override parse(interaction: ButtonInteraction) {
		// If no arguments to parse:
		// return checkStringId(interaction.customId, StringId.ArbitraryButton);
		return parseCustomId(interaction.customId, CustomId.ArbitraryButton);
	}
}
