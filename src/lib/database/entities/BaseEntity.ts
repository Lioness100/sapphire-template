import type { Snowflake } from 'discord.js';
import { PrimaryKey } from '@mikro-orm/core';

export default abstract class BaseEntity {
  @PrimaryKey({ type: 'string' })
  public _id!: Snowflake;
}
