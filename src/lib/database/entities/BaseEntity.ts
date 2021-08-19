import type { Snowflake } from 'discord.js';
import type { EntityData } from '@mikro-orm/core';
import { PrimaryKey } from '@mikro-orm/core';

export default abstract class BaseEntity {
  @PrimaryKey({ type: 'string' })
  public _id!: Snowflake;

  public constructor(data: EntityData<BaseEntity>) {
    Object.assign(this, data);
  }
}
