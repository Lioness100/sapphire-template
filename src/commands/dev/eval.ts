import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import { Type } from '@sapphire/type';
import { inspect } from 'util';
import Command from '#structures/Command';

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
  preconditions: ['OwnerOnly'],
  flags: ['async', 'silent', 's'],
  options: ['depth', 'decimals'],
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
      return message.channel.send({
        content: `Output was too long... sent the result as a file.\n\n${typeFooter}`,
        files: [{ attachment: Buffer.from(output), name: 'output.txt' }],
      });
    }

    return message.channel.send(`${output}\n${typeFooter}\n${timeFooter}`);
  }

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
        this.container.logger.error(error);
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
