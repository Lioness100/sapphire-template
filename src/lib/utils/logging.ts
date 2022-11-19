import { container, type Piece, UserError } from '@sapphire/framework';
import { bold, cyan, redBright } from 'colorette';
import type { Interaction, RepliableInteraction } from 'discord.js';
import { sendError } from '#utils/responses';

export const logPieceSuccess = (piece: Piece, interaction: Interaction) => {
	const nameDisplay = cyan(bold(`[commands/${piece.name}]`));
	container.logger.debug(`${nameDisplay} - Executed by ${interaction.user.tag} (${interaction.user.id})`);
};

export const logPieceError = (error: Error, piece: Piece) => {
	container.logger.fatal(redBright(bold(`[${piece.store.name}/${piece.name}]`)), error);
};

export const reportPieceError = (error: Error, piece: Piece, interaction: RepliableInteraction) => {
	if (error instanceof UserError) {
		return sendError(interaction, error.message);
	}

	logPieceError(error, piece);
	return sendError(interaction, 'Something went wrong');
};

export const reportPieceDenial = (error: UserError, interaction: RepliableInteraction) => {
	if ((error.context as { silent?: true })?.silent) {
		return;
	}

	return sendError(interaction, error.message, { prefix: '🚫' });
};
