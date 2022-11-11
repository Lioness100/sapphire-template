import { container, type ILogger, type Piece } from '@sapphire/framework';
import { Logger as TSLogger } from 'tslog';
import { redBright, bold } from 'colorette';

export class Logger extends TSLogger implements ILogger {
	public has(): never {
		throw new Error('Not Implemented');
	}

	public write(): never {
		throw new Error('Not Implemented');
	}

	public static reportPieceError(error: Error, piece: Piece) {
		container.logger.fatal(redBright(bold(`[${piece.store.name}/${piece.name}]`)), error);
	}
}
