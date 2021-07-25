import type { Args } from '@sapphire/framework';
import { Store } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { toTitleCase } from '@sapphire/utilities';

const commands = Store.injectedContext.stores.get('commands');

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

    if (!commands.has(commandName.toLowerCase())) {
      throw 'Please input a valid command';
    }

    const command = commands.get(commandName.toLowerCase()) as Command;
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

    return message.channel.send(embed);
  }

  private async menu(message: Message) {
    const embed = message.embed().setTimestamp();
    const categories = new Set<string>(commands.map((command) => (command as Command).category));

    for (const cat of categories) {
      const categoryCommands = commands.filter(
        (cmd) => (cmd as Command).category.toLowerCase() === cat.toLowerCase()
      );
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

    return message.channel.send(embed);
  }
}
