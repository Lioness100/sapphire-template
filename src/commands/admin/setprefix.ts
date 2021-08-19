import type { CommandOptions, Args } from '@sapphire/framework';
import type GuildMessage from '#root/lib/types/GuildMessage';
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({
  runIn: 'GUILD_ANY',
  description: 'Set a new prefix for this guild',
  preconditions: ['ModOnly'],
})
export class UserCommand extends Command {
  public async run(message: GuildMessage, args: Args) {
    const newPrefix = await this.handleArgs(args.rest('string'), 'Please provide a new prefix!');
    const guild = await this.container.guilds.ensure(message.guild.id);

    guild.prefix = newPrefix;
    this.client.prefixCache.set(message.guild.id, newPrefix);
    await this.container.guilds.persist(guild).flush();

    return this.embed(
      message,
      `OK, the prefix in this guild has been set to \`${newPrefix}\`!`,
      true
    );
  }
}
