import { container, type Piece, type UserError } from '@sapphire/framework';
import { bold, cyan, redBright } from 'colorette';
import type { Interaction, RepliableInteraction } from 'discord.js';
import { sendError } from '#utils/responses';

export const logPieceSuccess = (piece: Piece, interaction: Interaction) => {
	const nameDisplay = cyan(bold(`[commands/${piece.name}]`));
	container.logger.debug(`${nameDisplay} - Executed by ${interaction.user.tag} (${interaction.user.id})`);
};

export const logPieceError = (error: unknown, piece: Piece) => {
	container.logger.fatal(redBright(bold(`[${piece.store.name}/${piece.name}]`)), error);
};

export const reportPieceDenial = (error: UserError, interaction: RepliableInteraction) => {
	if ((error.context as { silent?: true })?.silent) {
		return;
	}

	return sendError(interaction, error.message, { prefix: '🚫' });
};
