import type { ILogger } from '@sapphire/framework';
import { Logger } from 'tslog';

export default class TSLogger extends Logger implements ILogger {
  public has(): never {
    throw new Error('Not Implemented');
  }

  public write(): never {
    throw new Error('Not Implemented');
  }
}
