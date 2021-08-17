import type { ArgType, CommandOptions, PieceContext } from '@sapphire/framework';
import { Command } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { sep } from 'path';

export default abstract class CustomCommand extends Command {
  public category: string;
  public usage?: string;

  public constructor(context: PieceContext, options: CommandOptions) {
    super(context, { generateDashLessAliases: true, ...options });
    this.usage = options.usage;
    this.category = toTitleCase(this.path.split(sep).reverse()[1]);
  }

  protected handleArgs<T extends ArgType[keyof ArgType]>(
    getArg: Promise<T>,
    message: string
  ): Promise<T> {
    return getArg.catch(() => {
      throw message;
    });
  }

  public get client() {
    return this.container.client;
  }

  public get embed() {
    return this.container.embed;
  }
}
