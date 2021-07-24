import type {
  Result,
  ArgType,
  CommandOptions as BaseCommandOptions,
  PieceContext,
  UserError,
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

  protected async handleArgs<T extends ArgType[keyof ArgType]>(
    getArg: Promise<Result<T, UserError>>,
    message: string
  ): Promise<T> {
    const res = await getArg;
    if (res.success) {
      return res.value;
    }

    throw message;
  }
}

export interface CommandOptions extends BaseCommandOptions {
  usage?: string;
}
