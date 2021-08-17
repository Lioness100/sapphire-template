import type { CommandDeniedPayload, UserError } from '@sapphire/framework';
import { Listener, Events } from '@sapphire/framework';

export default class UserEvent extends Listener<typeof Events.CommandDenied> {
  public run(error: UserError, { message }: CommandDeniedPayload) {
    if (Reflect.get(Object(error.context), 'silent')) {
      return;
    }

    return this.container.error(message, error.message);
  }
}
