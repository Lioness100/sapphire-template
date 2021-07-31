import type { Message } from 'discord.js';
import type { Args, StoreRegistryEntries } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import { Stopwatch } from '@sapphire/stopwatch';

@ApplyOptions<CommandOptions>({
  aliases: ['r'],
  description: 'Reloads a piece or store',
  usage: '<<piece> | <store> --store>',
  preconditions: [Preconditions.OwnerOnly],
  strategyOptions: {
    flags: ['store'],
  },
})
export default class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const isStore = args.getFlags('store');
    const type = isStore ? 'store' : 'piece';

    const arg = await this.handleArgs(args.pick('string'), `Please provide a ${type} to reload!`);

    const promise = isStore
      ? this.reloadStore(arg as keyof StoreRegistryEntries)
      : this.reloadPiece(arg);

    const stopwatch = new Stopwatch();
    await promise;

    void message.embed(`The \`${arg}\` ${type} has been reloaded\n${stopwatch.stop()} ⏱`, true);
  }

  /**
   * reload a store
   * @param storeKey - name of store to query `stores.get()`
   */
  private reloadStore(storeKey: keyof StoreRegistryEntries) {
    const store = this.context.stores.get(storeKey);
    if (!store) {
      throw 'Please provide a valid store to reload!';
    }

    return store.loadAll();
  }

  /**
   * reloads a piece (searches through all stores to find a match)
   * @param piece - name of piece to query `store.get()`
   */
  private reloadPiece(pieceKey: string) {
    const piece = this.context.stores.find((store) => store.has(pieceKey))?.get(pieceKey);
    if (!piece) {
      throw 'Please provide a valid piece to reload!';
    }

    return piece.reload();
  }
}
