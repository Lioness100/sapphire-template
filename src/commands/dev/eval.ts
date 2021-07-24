import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { inspect } from 'util';
import Command from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Evals any JavaScript code',
  quotes: [],
  preconditions: [Preconditions.OwnerOnly],
  strategyOptions: {
    flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
    options: ['depth'],
  },
})
export default class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const code = await this.handleArgs(
      args.restResult('string'),
      'Please provide code to evaluate'
    );

    const { result, success, type } = await this.eval(message, code, {
      async: args.getFlags('async'),
      depth: Number(args.getOption('depth')) ?? 0,
    });

    const output = success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`;
    if (args.getFlags('silent', 's')) {
      return null;
    }

    const typeFooter = `**Type**: ${codeBlock('typescript', type)}`;

    if (output.length > 2000) {
      return message.channel.send(
        `Output was too long... sent the result as a file.\n\n${typeFooter}`,
        {
          files: [{ attachment: Buffer.from(output), name: 'output.txt' }],
        }
      );
    }

    return message.channel.send(`${output}\n${typeFooter}`);
  }

  private async eval(message: Message, code: string, flags: { async: boolean; depth: number }) {
    if (flags.async) {
      code = `(async () => {\n${code}\n})();`;
    }
    // @ts-expect-error value is never read, this is so `msg` is possible as an alias when sending the eval.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const msg = message;

    let success = true;
    let result = null;

    try {
      // eslint-disable-next-line no-eval
      result = eval(code);
    } catch (error) {
      if (error && error.stack) {
        this.context.client.logger.error(error);
      }
      result = error;
      success = false;
    }

    const type = new Type(result).toString();
    if (isThenable(result)) {
      result = await result;
    }

    if (typeof result !== 'string') {
      result = inspect(result, {
        depth: flags.depth,
      });
    }

    return { result, success, type };
  }
}
