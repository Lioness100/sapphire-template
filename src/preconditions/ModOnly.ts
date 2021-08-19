import type GuildMessage from '#root/lib/types/GuildMessage';
import { Permissions } from 'discord.js';
import { Precondition } from '@sapphire/framework';

export default class UserPrecondition extends Precondition {
  public run(message: GuildMessage) {
    return message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
      ? this.ok()
      : this.error({ message: "You're missing the `Manage Guild` permission" });
  }
}
