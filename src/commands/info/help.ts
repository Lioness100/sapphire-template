import type { Args, CommandStore } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { toTitleCase } from '@sapphire/utilities';

@ApplyOptions<CommandOptions>({
  aliases: ['commands', 'cmds'],
  description: 'Displays all commands or the description of one.',
  usage: '[command]',
  strategyOptions: { flags: ['categories', 'all'] },
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const commandName = await args.pick('string').catch(() => null);

    if (!commandName) {
      return this.menu(message);
    }

    const command = this.store.get(commandName.toLowerCase()) as Command | undefined;
    if (!command) {
      throw 'Please input a valid command';
    }

    const prefix = process.env.PREFIX;

    const embed = message
      .embed()
      .addField(
        '❯ Usage',
        `\`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\``
      )
      .addField(
        '❯ Detailed Description',
        command.detailedDescription || 'No detailed description was provided.'
      )
      .setTimestamp();

    if (command.description) {
      embed.setDescription(command.description);
    }

    return message.send(embed);
  }

  private async menu(message: Message) {
    const embed = message.embed().setTimestamp();
    const categories = new Set<string>(this.store.map((command) => (command as Command).category));

    for (const cat of categories) {
      const categoryCommands = this.store.filter(
        (cmd) => (cmd as Command).category.toLowerCase() === cat.toLowerCase()
      ) as CommandStore;
      const displayed = [];

      for (const command of categoryCommands.values()) {
        const displayable = await command.preconditions.run(message, command, { command: null });
        if (displayable.success) {
          displayed.push(command);
        }
      }

      if (displayed.length) {
        embed.addField(
          `❯ ${toTitleCase(cat)}`,
          displayed.map(
            (cmd) => `\`${cmd.name}\` → *${cmd.description || 'No description was provided.'}*`
          )
        );
      }
    }

    return message.send(embed);
  }
}
