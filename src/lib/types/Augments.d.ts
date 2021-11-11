import type { embed, error } from '#utils/embeds';

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		embed: typeof embed;
		error: typeof error;
	}
}
