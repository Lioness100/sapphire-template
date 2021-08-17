import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { inlineCodeBlock, toTitleCase } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

const store = container.stores.get('commands');

@ApplyOptions<CommandOptions>({
  aliases: ['commands', 'cmds'],
  description: 'Displays all commands or the description of one',
  usage: '[command]',
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const commandName = await args.pick('string').catch(() => null);

    if (!commandName) {
      return this.menu(message);
    }

    const command = store.get(commandName.toLowerCase());
    if (!command) {
      throw 'Please input a valid command';
    }

    const prefix = process.env.PREFIX;

    return this.embed(message, command.description, (embed) => {
      embed
        .addField('❯ Category', command.category)
        .setDescription(command.description)
        .setTimestamp();

      if (command.aliases.length) {
        embed.addField('❯ Aliases', command.aliases.map(inlineCodeBlock).join(' '));
      }

      if (command.usage) {
        embed.addField(
          '❯ Usage',
          `\`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\``
        );
      }

      if (command.detailedDescription) {
        embed.addField(
          '❯ Detailed Description',
          command.detailedDescription || 'No detailed description was provided.'
        );
      }
    });
  }

  private menu(message: Message) {
    this.embed(message, 'My Commands!', async (embed) => {
      const categories = new Set(store.map((cmd) => cmd.category));

      for (const cat of categories) {
        const categoryCommands = store.filter(
          (cmd) => cmd.category.toLowerCase() === cat.toLowerCase()
        );
        const displayed = [];

        for (const command of categoryCommands.values()) {
          const displayable = await command.preconditions.run(message, command, { command: null });
          if (displayable.success) {
            displayed.push(command);
          }
        }

        if (displayed.length) {
          const display = displayed
            .map(
              (cmd) => `\`${cmd.name}\` → *${cmd.description || 'No description was provided.'}*`
            )
            .join('\n');

          embed.addField(`❯ ${toTitleCase(cat)}`, display);
        }
      }

      embed.setTimestamp();
    });
  }
}
