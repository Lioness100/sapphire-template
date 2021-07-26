import type { CommandErrorPayload, Events } from '@sapphire/framework';
import { Event, UserError, ArgumentError } from '@sapphire/framework';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { RESTJSONErrorCodes } from 'discord-api-types/v8';
import { bold, redBright } from 'colorette';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserEvent extends Event<Events.CommandError> {
  public run(error: Error | string, { message, piece }: CommandErrorPayload) {
    if (typeof error === 'string') {
      return message.error(error);
    }

    if (error instanceof ArgumentError) {
      return message.error(error.message);
    }

    if (error instanceof UserError) {
      if (Reflect.get(Object(error.context), 'silent')) {
        return;
      }

      return message.error(error.message);
    }

    if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
      return message.error('I had an issue communicating with Discord- please try again!');
    }

    if (error instanceof DiscordAPIError || error instanceof HTTPError) {
      if (ignoredCodes.includes(error.code)) {
        return;
      }
    }

    this.context.logger.fatal(
      `${redBright(bold(`[${piece.name}]`))}\n${error.stack || error.message}`
    );
    return message.error(error.message, { title: 'Something went wrong!' });
  }
}
