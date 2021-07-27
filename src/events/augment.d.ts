import type { Snowflake } from 'discord.js';

declare module '@sapphire/pieces' {
  interface PieceContextExtras {
    owner?: Snowflake;
  }
}
