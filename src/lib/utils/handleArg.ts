import type { Result, ArgType } from '@sapphire/framework';
import { UserError } from '@sapphire/framework';

export const handleArg = async <T extends ArgType[keyof ArgType]>(
  getArg: Promise<Result<T, UserError>>,
  message: string,
  identifier = 'CustomArgumentError'
): Promise<T> => {
  const res = await getArg;
  if (res.success) {
    return res.value;
  }

  throw new UserError({ identifier, message });
};
