import type { CommandErrorPayload } from '@sapphire/framework';
import { Listener, Events, UserError, ArgumentError } from '@sapphire/framework';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { bold, redBright } from 'colorette';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export default class UserEvent extends Listener<typeof Events.CommandError> {
  public run(error: Error | string, { message, piece }: CommandErrorPayload) {
    const sendError = this.container.error.bind(null, message);

    if (typeof error === 'string') {
      return sendError(error);
    }

    if (error instanceof ArgumentError) {
      return sendError(error.message);
    }

    if (error instanceof UserError) {
      if (Reflect.get(Object(error.context), 'silent')) {
        return;
      }

      return sendError(error.message);
    }

    if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
      return sendError('I had an issue communicating with Discord- please try again');
    }

    if (error instanceof DiscordAPIError || error instanceof HTTPError) {
      if (ignoredCodes.includes(error.code)) {
        return;
      }
    }

    this.container.logger.fatal(
      new Error(`${redBright(bold(`[${piece.name}]`))}\n${error.stack || error.message}`)
    );

    return sendError(error.message, { title: 'Something went wrong!' });
  }
}
