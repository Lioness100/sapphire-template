import type { SapphireClient } from '@sapphire/framework';

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}

declare module '@sapphire/pieces' {
	interface Piece {
		client: SapphireClient;
	}
}
