import type { EmbedFieldData, Message } from 'discord.js';
import { container, isOk, isErr, Args } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { bold, inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FuzzySearch } from '#utils/parsers/FuzzySearch';
import { toTitleCase } from '@sapphire/utilities';
import { Collection } from 'discord.js';
import { commaList } from '#utils/strings';
import { getPrefix } from '#utils/discord';
import { Command } from '#structures/Command';

@ApplyOptions<Command.Options>({
	aliases: ['commands', 'cmds'],
	description: 'Display all commands or the description of one',
	detailedDescription: [
		'This command shows a menu of all of my commands!',
		"If you specify a specific command, I'll provide more in depth information on it's usage.",
		'\n\nLastly, you can use the `--cat` or `--categories` flag to show a menu of only the command categories (and how many commands are in each)'
	].join(' '),
	flags: ['cat', 'categories'],
	usages: ['command_name', '--categories/--cat'],
	examples: ['ping', 'prefix', '--categories'],
	tip: 'This will only show commands that you have access to!'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Command.Args, context: Command.Context) {
		if (args.getFlags('cat', 'categories')) {
			return this.displayCategories(message);
		}

		const result = await args.pickResult(UserCommand.command);
		if (isOk(result)) {
			return this.displayCommand(message, result.value, context);
		}

		return this.display(message, context);
	}

	private async displayCategories(message: Message) {
		const commandsByCategory = await UserCommand.fetchCommands(message);

		const display = [...commandsByCategory.entries()].map(([category, commands], idx) => {
			const line = (idx + 1).toString().padStart(2, '0');
			return `${inlineCode(`${line}.`)} ${bold(toTitleCase(category))} → ${commands.length} commands`;
		});

		return this.embed(message, display.join('\n'), { title: 'Here are all my command categories!' });
	}

	private displayCommand(message: Message, command: Command, context: Command.Context) {
		const prefix = getPrefix(context);
		const rawFields = [
			['Description', command.description],
			['Detailed Description', command.detailedDescription],
			['Aliases', commaList(command.aliases.map(inlineCode))],
			['Usage', command.usages?.map((usage) => `→ ${inlineCode(`${prefix}${command.name} ${usage}`)}`).join('\n')],
			['Examples', command.examples?.map((usage) => `→ ${inlineCode(`${prefix}${command.name} ${usage}`)}`).join('\n')],
			['Tip! 💡', command.tip]
		];

		const embedFields = rawFields //
			.filter(([_, value]) => value)
			.map(([name, value]) => ({ name: `❯ ${name}`, value })) as EmbedFieldData[];

		return this.embed(message, '', (embed) => {
			embed
				.setAuthor(this.client.user!.tag, this.client.user!.displayAvatarURL({ size: 128, dynamic: true }))
				.setTitle(`${toTitleCase(command.name)} Command Info`)
				.addFields(embedFields);
		});
	}

	private async display(message: Message, context: Command.Context) {
		const prefix = getPrefix(context);
		const commandsByCategory = await UserCommand.fetchCommands(message);

		const handler = new PaginatedMessage({ template: this.embed(message) }).setSelectMenuOptions((idx) => ({
			label: `${toTitleCase(commandsByCategory.at(idx - 1)![0].category ?? `Page ${idx}`)} Commands`
		}));

		for (const [category, commands] of commandsByCategory) {
			const commandDisplays = commands.map((command) => `• ${inlineCode(`${prefix}${command.name}`)} → ${command.description}`);
			handler.addPageEmbed((embed) => {
				return embed //
					.setTitle(`${toTitleCase(category)} Commands`)
					.setDescription(commandDisplays.join('\n'));
			});
		}

		return handler.run(message, message.author);
	}

	private static command = Args.make<Command>(async (parameter, { argument, command, message }) => {
		const store = container.stores.get('commands');
		let found = store.get(parameter.toLowerCase());

		if (!found) {
			const searcher = new FuzzySearch(
				store,
				(piece) => piece.name,
				(piece) => piece.description
			);

			const possibilities = await searcher.run(message, parameter);
			if (!possibilities) {
				return Args.error({ argument, parameter });
			}

			[, found] = possibilities;
		}

		const result = await found.preconditions.run(message, command, { external: true });

		return isOk(result)
			? Args.ok(found as Command)
			: Args.error({ argument, parameter, message: `A command was found, but you can't use it here. ${result.error.message}` });
	});

	private static async fetchCommands(message: Message) {
		const commands = container.stores.get('commands');
		const filtered = new Collection<string, Command[]>();
		await Promise.all(
			commands.map(async (command) => {
				// external: true will ignore the cooldown precondition
				const result = await command.preconditions.run(message, command, { external: true });
				if (isErr(result)) {
					return;
				}

				const cat = command.category!;
				filtered.set(cat, [command as Command, ...(filtered.get(cat) || [])]);
			})
		);

		return filtered.sort();
	}
}
