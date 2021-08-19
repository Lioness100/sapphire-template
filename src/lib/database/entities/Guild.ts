import type { EntityData } from '@mikro-orm/core';
import { Property, Entity } from '@mikro-orm/core';
import BaseEntity from '#entities/BaseEntity';

@Entity()
export default class Guild extends BaseEntity {
  @Property()
  public prefix!: string;

  public constructor(data: EntityData<Guild>) {
    super(data);
  }
}
