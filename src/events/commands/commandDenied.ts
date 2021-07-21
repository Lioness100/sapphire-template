import type { CommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

export class UserEvent extends Event<Events.CommandDenied> {
  public run(
    { context, message: content, identifier }: UserError,
    { message }: CommandDeniedPayload
  ) {
    if (Reflect.get(Object(context), 'silent')) {
      return;
    }

    return message.error(identifier, content);
  }
}
