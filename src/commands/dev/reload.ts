import type { Args, CommandOptions, StoreRegistryEntries } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({
  aliases: ['r'],
  description: 'Reloads a piece or store',
  usage: '<<piece> | <store> --store>',
  preconditions: ['OwnerOnly'],
  flags: ['store'],
})
export default class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const isStore = args.getFlags('store');
    const type = isStore ? 'store' : 'piece';

    const arg = await this.handleArgs(args.pick('string'), `Please provide a ${type} to reload!`);
    const promise = isStore ? this.reloadStore(arg) : this.reloadPiece(arg);

    const stopwatch = new Stopwatch();
    await promise;

    return this.embed(
      message,
      `The \`${arg}\` ${type} has been reloaded\n${stopwatch.stop()} ⏱`,
      true
    );
  }

  private reloadStore(storeKey: string) {
    const store = this.container.stores.get(storeKey as keyof StoreRegistryEntries);
    if (!store) {
      throw 'Please provide a valid store to reload';
    }

    return store.loadAll();
  }

  private reloadPiece(pieceKey: string) {
    const piece = this.container.stores.find((store) => store.has(pieceKey))?.get(pieceKey);
    if (!piece) {
      throw 'Please provide a valid piece to reload';
    }

    return piece.reload();
  }
}
