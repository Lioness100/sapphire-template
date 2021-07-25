import type {
  ArgType,
  CommandOptions as BaseCommandOptions,
  PieceContext,
} from '@sapphire/framework';
import { Command as BaseCommand } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { sep } from 'path';

export abstract class Command extends BaseCommand {
  public category: string;
  public usage?: string;

  public constructor(context: PieceContext, options: CommandOptions) {
    super(context, options);
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
}

export interface CommandOptions extends BaseCommandOptions {
  usage?: string;
}
