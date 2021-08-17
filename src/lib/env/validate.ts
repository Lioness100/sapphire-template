import { isNullishOrEmpty } from '@sapphire/utilities';
import { bold, red } from 'colorette';

const validate = <T extends keyof NodeJS.ProcessEnv>(
  key: T,
  customFn?: (value: NodeJS.ProcessEnv[T]) => unknown,
  required = true
) => {
  const value = process.env[key];
  if (required && isNullishOrEmpty(value)) {
    console.error(bold(red(`"${key}" in .env is required, but is empty or undefined`)));
    process.exit(1);
  }
  if (value && customFn) {
    const error = customFn(value);
    if (typeof error === 'string') {
      console.error(bold(red(`"${key}" in .env ${error}`)));
      process.exit(1);
    }
  }
};

export default validate;
