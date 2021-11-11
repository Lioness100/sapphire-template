import type { CommandErrorPayload } from '@sapphire/framework';
import { Listener, Events, UserError, ArgumentError } from '@sapphire/framework';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { quote, italic, inlineCode } from '@discordjs/builders';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { bold, redBright } from 'colorette';
import { getPrefix } from '#utils/discord';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export default class UserEvent extends Listener<typeof Events.CommandError> {
	public run(error: Error, { message, command, context }: CommandErrorPayload) {
		const sendError = (content: string) => {
			this.container.error(message, content, (embed) => {
				const helpCommandUsage = `${getPrefix(context)} help ${context.commandName}`;
				const tip = `You can use ${inlineCode(helpCommandUsage)} to find out how to use this command!`;
				embed.description += `\n${quote(italic(tip))}`;
			});
		};

		if (error instanceof ArgumentError || error instanceof UserError) {
			if (Reflect.get(Object(error.context), 'silent')) {
				return;
			}

			return sendError(error.message);
		}

		if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
			return sendError('I had an issue communicating with Discord. Please try again');
		}

		if ((error instanceof DiscordAPIError || error instanceof HTTPError) && ignoredCodes.includes(error.code)) {
			return;
		}

		this.container.logger.fatal(`${redBright(bold(`[${command.name}]`))}\n${error.stack || error.message}`);
		return sendError('Something went wrong');
	}
}
