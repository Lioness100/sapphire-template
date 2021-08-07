import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { inspect } from 'util';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import { Stopwatch } from '@sapphire/stopwatch';

interface EvalFlags {
  async: boolean;
  depth: number;
  decimals?: number;
}

@ApplyOptions<CommandOptions>({
  description: 'Evals any JavaScript code',
  detailedDescription: [
    'Evaluates any JavaScript code and sends the result',
    'or error accompanied by a return type.',
  ].join(' '),
  usage: '<...code> [--async] [--silent|--s]',
  quotes: [],
  preconditions: [Preconditions.OwnerOnly],
  strategyOptions: {
    flags: ['async', 'silent', 's'],
    options: ['depth', 'decimals'],
  },
})
export default class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const code = await this.handleArgs(args.rest('string'), 'Please provide code to evaluate');

    const { result, success, type, stopwatch } = await this.eval(message, code, {
      async: args.getFlags('async'),
      depth: Number(args.getOption('depth')) ?? 0,
      decimals: Number(args.getOption('decimals')),
    });

    const output = success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`;
    if (args.getFlags('silent', 's')) {
      return null;
    }

    const typeFooter = `**Type**: ${codeBlock('typescript', type)}`;
    const timeFooter = `${stopwatch} ⏱`;

    if (output.length > 2000) {
      return message.send(`Output was too long... sent the result as a file.\n\n${typeFooter}`, {
        files: [{ attachment: Buffer.from(output), name: 'output.txt' }],
      });
    }

    return message.send(`${output}\n${typeFooter}\n${timeFooter}`);
  }

  /**
   * executes javascript code, times it, types it, and handles the result
   * @param message - the message that triggered the command. this can be referenced inside the eval
   * @param code - the code to eval (if {@link EvalFlags.async}, this will be wrapped in an async function)
   * @param flags - code/result modifiers
   */
  private async eval(message: Message, code: string, flags: EvalFlags) {
    if (flags.async) {
      code = `(async () => {\n${code}\n})();`;
    }

    let success = true;
    let result = null;

    const stopwatch = new Stopwatch(flags.decimals);

    try {
      // @ts-expect-error 6133
      const msg = message;

      // eslint-disable-next-line no-eval
      result = eval(code);
      if (isThenable(result)) {
        result = await result;
      }

      stopwatch.stop();
    } catch (error) {
      stopwatch.stop();
      if (error && error.stack) {
        this.context.client.logger.error(error);
      }
      result = error;
      success = false;
    }

    const type = new Type(result).toString();

    if (typeof result !== 'string') {
      result = inspect(result, {
        depth: flags.depth,
      });
    }

    return { result, success, type, stopwatch };
  }
}
