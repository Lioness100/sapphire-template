import { writeFile, readdir } from 'fs/promises';
import { blue, green, bold } from 'colorette';
import wrap from 'wordwrapjs';
import prompt from 'prompts';
import yargs from 'yargs';

prompt.override(yargs(process.argv).argv);

const categories = await readdir('./src/commands');
const { cat } = await prompt({
  type: 'select',
  name: 'cat',
  message: "What is the command's category?",
  choices: categories,
  format: (val) => categories[val],
});

if (!cat) {
  throw new Error('Specify a category!');
}

const read = (path) =>
  readdir(path).then((files) =>
    files.filter((file) => file.endsWith('.js')).map((file) => file.split('.')[0])
  );

const existingCommands = await read(`./src/commands/${cat}`);
const addedPreconditions = await read('./src/preconditions');
const builtInPreconditions = await read('./node_modules/@sapphire/framework/dist/preconditions');
const preconditions = [...addedPreconditions, ...builtInPreconditions];

const validate = (fn) => {
  if (!fn) {
    return 'This parameter is required';
  }

  if (typeof fn === 'string') {
    return true;
  }

  return (val) => {
    if (!val) {
      return 'This parameter is required';
    }

    return fn(val);
  };
};

const questions = [
  {
    type: 'text',
    name: 'name',
    message: "What is the command's name?",
    format: (val) => val.toLowerCase(),
    validate: validate(
      (val) => !existingCommands.includes(val.toLowerCase()) || 'This command already exists'
    ),
  },
  {
    type: 'list',
    name: 'aliases',
    message: "What are the command's aliases?",
  },
  {
    type: 'text',
    name: 'desc',
    message: "What is the command's description?",
    validate,
  },
  {
    type: 'text',
    name: 'detailedDesc',
    message: "What is the command's detailed description?",
    format: (val) => {
      if (val.length < 63) {
        return val;
      }

      return wrap.lines(val, { length: 63 });
    },
  },
  {
    type: 'text',
    name: 'usage',
    message: "What is the command's usage?",
  },
  {
    type: 'autocompleteMultiselect',
    name: 'preconditions',
    message: "What are the command's preconditions?",
    choices: preconditions,
    format: (vals) => vals.map((val) => preconditions[val]),
  },
  {
    type: 'confirm',
    name: 'async',
    message: 'Is the command async?',
  },
];

const results = await prompt(questions);
if (!results.name) {
  throw new Error('You must specify a name');
}

if (!results.desc) {
  throw new Error('You must specify a description');
}

const flags = results.usage.match(/\[--\w+\]/g)?.map((val) => val.slice(3, -1));
const options = results.usage.match(/\[--\w+=/g)?.map((val) => val.slice(3, -1));

const content = `import type { CommandOptions${
  results.usage ? ', Args' : ''
} } from '@sapphire/framework';
import type { Message } from 'discord.js';${
  results.preconditions.some((precondition) => builtInPreconditions.includes(precondition))
    ? "\nimport { CommandPreConditions } from '@sapphire/framework'"
    : ''
}
import { ApplyOptions } from '@sapphire/decorators';
import Command from '#structures/Command';

@ApplyOptions<CommandOptions>({${
  results.aliases[0] ? `\n  aliases: ['${results.aliases.join("', '")}'],` : ''
}
  description: '${results.desc}',${
  results.detailedDesc
    ? `\n  detailedDescription: ${
        results.detailedDesc.length === 1
          ? `"${results.detailedDesc[0]}"`
          : `[\n    "${results.detailedDesc.join('",\n    "')}"\n  ].join(' ')`
      },`
    : ''
}${results.usage ? `\n  usage: '${results.usage}',` : ''}${
  flags ? `\n  flags: ['${flags.join(", '")}'],` : ''
}${options ? `\n  options: ['${options.join(", '")}'],` : ''}${
  results.preconditions.length
    ? `\n  preconditions: [${results.preconditions.map(
        (precondition) =>
          `${
            builtInPreconditions.includes(precondition)
              ? `CommandPreConditions.${precondition}`
              : precondition
          }, `
      )}]`
    : ''
}
})
export class UserCommand extends Command {
  public ${results.async ? 'async ' : ''}run(message: Message${
  results.usage ? ', args: Args' : ''
}) {
    ${
      flags
        ? `${flags.map((flag) => `const ${flag} = args.getFlags('${flag}');`).join('\n')}\n    `
        : ''
    }${
  options
    ? `${options
        .map((option) => `const ${option} = args.getOption('${option}');`)
        .join('\n')}\n    `
    : ''
}
  }
}
`;

const path = `src/commands/${cat}/${results.name}.ts`;
await writeFile(`./${path}`, content);

console.log(`${bold(blue(`${path} →`))} ${green('A new command was created!')}`);
