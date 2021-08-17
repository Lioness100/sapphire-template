import { writeFile, readdir } from 'fs/promises';
import { blue, green, bold } from 'colorette';
import { toTitleCase } from '@sapphire/utilities';
import prompt from 'prompts';
import yargs from 'yargs';

prompt.override(yargs(process.argv).argv);

const stores = ['listeners', 'preconditions', 'arguments'];
const { store } = await prompt({
  type: 'select',
  name: 'store',
  message: "What is the piece's store?",
  choices: stores,
  format: (val) => stores[val],
});

if (!store) {
  throw new Error('Specify a store!');
}

const read = (path) =>
  readdir(path)
    .then((files) => files.filter((file) => file.endsWith('s')).map((file) => file.split('.')[0]))
    .catch(() => []);

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

const existingPieces = await read(`./src/${store}`);
const nonPlural = store.slice(0, -1);
const questions = [
  {
    type: 'text',
    name: 'name',
    message: `What is the ${nonPlural}'s name?`,
    validate: validate((val) => !existingPieces.includes(val) || 'This piece already exists'),
  },
  {
    type: 'confirm',
    name: 'options',
    message: `Does the ${nonPlural} require configuration?`,
  },
  {
    type: 'confirm',
    name: 'async',
    message: `Is the ${nonPlural} async?`,
  },
];

const results = await prompt(questions);
if (!results.name) {
  throw new Error('You must specify a name');
}

const uppercase = toTitleCase(nonPlural);
const content = `${
  results.options ? `import type { ${uppercase}Options } from '@sapphire/framework';\n` : ''
}${
  nonPlural === 'precondition' ? "import type { Message } from 'discord.js';\n" : ''
}import { ${uppercase}${nonPlural === 'listener' ? ', Events' : ''} } from '@sapphire/framework';${
  results.options ? "\nimport { ApplyOptions } from '@sapphire/decorators';" : ''
}

${
  results.options
    ? `@ApplyOptions<${uppercase}Options>({
  
})
`
    : ''
}export default class User${uppercase} extends ${uppercase}${
  nonPlural === 'listener' ? `<typeof Events.${toTitleCase(results.name)}>` : ''
} {
  public ${results.async ? 'async ' : ''}run(${
  nonPlural === 'precondition'
    ? 'message: Message'
    : nonPlural === 'argument'
    ? 'parameter: string'
    : ''
}) {
  
  }
}
`;

const path = `src/${store}/${results.name}.ts`;
await writeFile(`./${path}`, content);

console.log(`${bold(blue(`${path} →`))} ${green(`A new ${nonPlural} was created!`)}`);
