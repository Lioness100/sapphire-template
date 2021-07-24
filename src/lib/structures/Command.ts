import type { Result, ArgType } from '@sapphire/framework';
import { Command, UserError } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';

export default abstract class extends Command {
  protected async handleArgs<T extends ArgType[keyof ArgType]>(
    getArg: Promise<Result<T, UserError>>,
    message: string
  ): Promise<T> {
    const res = await getArg;
    if (res.success) {
      return res.value;
    }

    const identifier = `${toTitleCase(this.name)}ArgumentError`;
    throw new UserError({ identifier, message });
  }
}
