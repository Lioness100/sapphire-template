import { ArgType } from '@sapphire/framework';

declare module '@sapphire/framework' {
  export class Command {
    public category: string;
    public usage?: string;
    public cooldown?: number;

    protected handleArgs<T extends ArgType[keyof ArgType]>(
      getArg: Promise<T>,
      message: string
    ): Promise<T>;
  }
}
