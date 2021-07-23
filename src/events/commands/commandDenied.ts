import type { CommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

export class UserEvent extends Event<Events.CommandDenied> {
  public run(error: UserError, { message }: CommandDeniedPayload) {
    if (Reflect.get(Object(error.context), 'silent')) {
      return;
    }

    return message.error(error.message);
  }
}
