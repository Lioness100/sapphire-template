import type { FilterQuery } from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';
import type BaseEntity from '#entities/BaseEntity';
import { EntityRepository } from '@mikro-orm/core';

export default class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
  public ensure(_id: Snowflake) {
    return this.findOneOrFail(_id as FilterQuery<T>).catch(() => this.create({ _id }));
  }
}
