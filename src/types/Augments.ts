/* eslint-disable @typescript-eslint/no-namespace */
import type { ColorResolvable, ActivityType } from 'discord.js';
import type { ArgType } from '@sapphire/framework';
import type { embed, error } from '#factories/embeds';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      PREFIX: string;
      COLOR: ColorResolvable;
      PRESENCE_NAME: string;
      PRESENCE_TYPE: ActivityType;
    }
  }
}

declare module '@sapphire/framework' {
  class Command {
    public category: string;
    public usage?: string;

    protected handleArgs<T extends ArgType[keyof ArgType]>(
      getArg: Promise<T>,
      message: string
    ): Promise<T>;
  }

  interface CommandOptions {
    usage?: string;
  }

  interface Preconditions {
    OwnerOnly: never;
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    embed: typeof embed;
    error: typeof error;
  }
}
