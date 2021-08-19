import type { Snowflake, Guild } from 'discord.js';
import { SapphireClient, container } from '@sapphire/framework';
import sapphireOptions from '#config/sapphire';

export default class CustomClient extends SapphireClient {
  public prefixCache = new Map<Snowflake, string>();

  public constructor() {
    super(sapphireOptions);

    this.fetchPrefix = (message) => {
      if (!message.guild) {
        return [process.env.PREFIX, ''];
      }

      return this.fetchGuildPrefix(message.guild);
    };
  }

  /**
   * fetch custom prefix to guild and fallback to default
   * @param guild - the guild to find the prefix from
   */
  private async fetchGuildPrefix(guild: Guild) {
    const cachedPrefix = this.prefixCache.get(guild.id);
    if (cachedPrefix) {
      return cachedPrefix;
    }

    const guildDocument = await container.guilds.findOne(guild.id, { fields: ['prefix'] });
    const prefix = guildDocument?.prefix ?? process.env.PREFIX;

    this.prefixCache.set(guild.id, prefix);
    return prefix;
  }
}
