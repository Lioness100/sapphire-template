import type {
  ArgType,
  CommandOptions as BaseCommandOptions,
  PieceContext,
  PreconditionEntryResolvable,
} from '@sapphire/framework';
import { Command as BaseCommand, PermissionsPrecondition } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import type { PermissionString } from 'discord.js';
import { sep } from 'path';
import { Preconditions } from '#types/Enums';

export abstract class Command extends BaseCommand {
  public category: string;
  public usage?: string;
  public cooldown?: number;

  public constructor(context: PieceContext, options: CommandOptions) {
    super(context, Command.resolvePreconditions(options));
    this.usage = options.usage;
    this.cooldown = options.cooldown;
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

  public static resolvePreconditions(options: CommandOptions) {
    options.generateDashLessAliases = options.generateDashLessAliases ?? true;
    options.preconditions = options.preconditions || [];

    const preconditions = (options.preconditions =
      options.preconditions || []) as PreconditionEntryResolvable[];

    if (options.permissions) {
      preconditions.push(new PermissionsPrecondition(options.permissions));
    }

    if (options.cooldown) {
      preconditions.push({
        name: Preconditions.Cooldown,
        context: { delay: options.cooldown },
      });
    }

    return options;
  }
}

export interface CommandOptions extends BaseCommandOptions {
  usage?: string;
  cooldown?: number;
  permissions?: PermissionString;
}
