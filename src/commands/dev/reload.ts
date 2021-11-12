import type { Piece, Store } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { container, isOk, Args } from '@sapphire/framework';
import { bold, inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Collection } from 'discord.js';
import { Stopwatch } from '@sapphire/stopwatch';
import { Command } from '#structures/Command';

@ApplyOptions<Command.Options>({
	aliases: ['r'],
	description: 'Reload a piece or store',
	detailedDescription: `If no arguments are inputted, ${bold('everything')} will be reloaded`,
	usages: ['piece', 'store --store'],
	examples: ['help', 'arguments --store'],
	preconditions: ['OwnerOnly'],
	flags: ['store']
})
export default class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const piece = await args.pickResult(UserCommand.piece);
		if (isOk(piece)) {
			return this.reloadPiece(message, piece.value);
		}

		const store = await args.pickResult(UserCommand.store);
		if (isOk(store)) {
			return this.reloadStore(message, store.value);
		}

		return this.reloadAll(message);
	}

	private async reloadPiece(message: Message, piece: Piece) {
		const timer = new Stopwatch();
		await piece.reload();
		const elapsed = timer.stop().toString();

		const type = piece.store.name.slice(0, -1);
		return this.embed(message, `The ${inlineCode(piece.name)} ${type} has been reloaded in ${elapsed}!`, true);
	}

	private async reloadStore(message: Message, store: Store<Piece>) {
		const timer = new Stopwatch();
		await store.loadAll();
		const elapsed = timer.stop().toString();

		return this.embed(message, `The ${inlineCode(store.name)} store has been reloaded in ${elapsed}!`, true);
	}

	private async reloadAll(message: Message) {
		const timer = new Stopwatch();
		await Promise.all(this.container.stores.map((store) => store.loadAll()));
		const elapsed = timer.stop().toString();

		return this.embed(message, `All stores have been reloaded in ${elapsed}`, true);
	}

	private static piece = Args.make<Piece>((parameter, { argument }) => {
		// flatten all pieces into one collection
		const pieces = new Collection<string, Piece>().concat(...container.stores.values());
		const piece = pieces.get(parameter.toLowerCase());

		return piece ? Args.ok(piece) : Args.error({ argument, parameter });
	});

	private static store = Args.make<Store<Piece>>((parameter, { argument }) => {
		const store = container.stores.get(parameter.toLowerCase());
		return store ? Args.ok(store) : Args.error({ argument, parameter });
	});
}
