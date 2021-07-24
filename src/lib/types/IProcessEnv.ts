import type { ActivityType, Snowflake } from 'discord.js';

export default interface IProcessEnv {
  TOKEN: string;
  PREFIX: string;
  COLOR: string;
  PRESENCE_NAME: string;
  PRESENCE_TYPE: ActivityType;
  OWNER_ID: Snowflake;
}
