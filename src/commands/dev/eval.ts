import type { Message } from 'discord.js';
import { codeBlock, inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isThenable } from '@sapphire/utilities';
import { Stopwatch } from '@sapphire/stopwatch';
import { addFields } from '#utils/embeds';
import { Command } from '#structures/Command';
import { Type } from '@sapphire/type';
import { inspect } from 'node:util';

interface EvalFlags {
	async: boolean;
	depth: number;
	decimals?: number;
}

@ApplyOptions<Command.Options>({
	description: 'Evaluate any JavaScript code',
	detailedDescription: [
		'Evaluate any JavaScript code and send the result, or error accompanied by a return type.',
		`${inlineCode('await')} can only be used with the ${inlineCode('async')} flag,`,
		'for which the result to show must be returned.'
	].join(' '),
	usages: ['code', 'code --async', 'code --silent', 'code --async --silent'],
	examples: [
		'"foo"',
		'return Promise.resolve("foo") --async',
		'console.log("foo") --silent',
		'console.log(await Promise.resolve("foo")) --silent --async'
	],
	quotes: [],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'silent'],
	options: ['depth', 'decimals']
})
export default class UserCommand extends Command {
	public async messageRun(message: Message, args: Command.Args) {
		const code = await args.rest('string');

		const { result, success, type, elapsed } = await this.eval(message, code, {
			async: args.getFlags('async'),
			depth: Number(args.getOption('depth')) ?? 0,
			decimals: Number(args.getOption('decimals'))
		});

		const output = success ? codeBlock('js', result) : codeBlock('bash', result);
		if (args.getFlags('silent')) {
			return null;
		}

		const embedLimitReached = output.length > 4096;
		const embed = addFields(this.embed(message, embedLimitReached ? 'Output was too long! The result has been sent as a file.' : output), [
			['Type 📝', codeBlock('ts', type)],
			['Elapsed ⏱', elapsed]
		]);

		if (success) {
			embed.setTitle('Eval Result ✨');
		} else {
			embed.setColor('RED').setTitle('Eval Error 💀');
		}

		return message.channel.send({ embeds: [embed], files: embedLimitReached ? [Buffer.from(output)] : [] });
	}

	private async eval(message: Message, code: string, flags: EvalFlags) {
		if (flags.async) {
			code = `(async () => {\n${code}\n})();`;
		}

		let success = true;
		let result = null;

		const stopwatch = new Stopwatch(flags.decimals);
		let elapsed = '';

		try {
			// @ts-expect-error 6133
			const msg = message;

			// eslint-disable-next-line no-eval
			result = eval(code);
			elapsed = stopwatch.toString();

			if (isThenable(result)) {
				stopwatch.restart();
				result = await result;
				elapsed = stopwatch.toString();
			}
		} catch (error) {
			if (!elapsed) {
				elapsed = stopwatch.toString();
			}

			result = error;
			success = false;
		}

		stopwatch.stop();

		const type = new Type(result).toString();

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth
			});
		}

		return { result, success, type, elapsed };
	}
}
