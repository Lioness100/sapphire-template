import { Args, Store } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { inlineCodeBlock, toTitleCase } from '@sapphire/utilities';

const store = Store.injectedContext.stores.get('commands');

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

    const command = store.get(commandName.toLowerCase());
    if (!command) {
      throw 'Please input a valid command';
    }

    const prefix = process.env.PREFIX;

    void message.embed(command.description, (embed) => {
      embed.addField('❯ Category', command.category);

      if (command.aliases.length) {
        embed.addField('❯ Aliases', command.aliases.map(inlineCodeBlock).join(' '));
      }

      embed
        .addField(
          '❯ Usage',
          `\`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\``
        )
        .addField(
          '❯ Detailed Description',
          command.detailedDescription || 'No detailed description was provided.'
        )
        .setTimestamp();

      embed.setDescription(command.description);
    });
  }

  /**
   * create a menu of all commands
   * @param message - the message that executed the command
   */
  private async menu(message: Message) {
    const embed = message.embed().setTimestamp();
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
