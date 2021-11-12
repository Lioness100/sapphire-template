/**
 * @license Apache License 2.0
 * @copyright 2019 Skyra Project
 * Modified for use in this project.
 */

import type { MessageComponentInteraction, MessageSelectOptionData } from 'discord.js';
import { Message, MessageActionRow, MessageSelectMenu } from 'discord.js';
import { decodeUtf8, jaroWinkler } from '@skyra/jaro-winkler';
import { Time } from '@sapphire/time-utilities';
import { embed } from '#utils/embeds';

type Accessor<V> = (access: V) => string;

export default class FuzzySearch<K extends string, V> {
	public constructor(private readonly collection: Map<K, V>, private readonly access: Accessor<V>, private readonly description?: Accessor<V>) {}

	public run(message: Message, query: string) {
		const lowerCaseQuery = query.toLowerCase();
		const decodedLowerCaseQuery = decodeUtf8(lowerCaseQuery);
		const results: [K, V, number][] = [];

		let threshold: number;
		if (lowerCaseQuery.length <= 3) {
			threshold = 1;
		} else if (lowerCaseQuery.length <= 6) {
			threshold = 0.8;
		} else if (lowerCaseQuery.length <= 12) {
			threshold = 0.7;
		} else {
			threshold = 0.6;
		}

		let almostExacts = 0;
		for (const [id, entry] of this.collection.entries()) {
			const current = this.access(entry);
			const lowerCaseName = current.toLowerCase();

			const similarity = lowerCaseName === lowerCaseQuery ? 1 : jaroWinkler(decodedLowerCaseQuery, lowerCaseName);

			if (similarity < threshold) {
				continue;
			}

			results.push([id, entry, similarity]);

			if (similarity >= 0.9) {
				almostExacts++;
			}

			if (almostExacts === 10) {
				break;
			}
		}

		if (!results.length) {
			return Promise.resolve(null);
		}

		const sorted = results.sort((a, b) => b[2] - a[2]);
		const precision = sorted[0][2];
		if (precision >= 0.9) {
			let i = 0;
			while (i < sorted.length && sorted[i][2] === precision) {
				i++;
			}
			return this.select(message, sorted.slice(0, i));
		}

		return this.select(message, sorted);
	}

	private async select(message: Message, results: [K, V, number][]) {
		if (results.length === 1) {
			return results[0];
		}

		if (results.length > 10) {
			results.length = 10;
		}

		const options: MessageSelectOptionData[] = results.map(([_, value], idx) => ({
			label: this.access(value),
			value: idx.toString(),
			description: this.description && this.description(value)
		}));

		const select = new MessageSelectMenu().setCustomId('fuzzy_search_select').setOptions(options);
		const row = new MessageActionRow().addComponents(select);

		const promptEmbed = embed(message, "Multiple results were found! Please select which command you'd like to view.");
		const sent = await message.channel.send({ embeds: [promptEmbed], components: [row] });

		const filter = async (interaction: MessageComponentInteraction) => {
			if (interaction.user.id !== message.author.id) {
				await interaction.reply({ content: '❌ Only the command executor can use this select menu!', ephemeral: true });
				return false;
			}

			return true;
		};

		const interaction = await sent.awaitMessageComponent({ filter, time: 10 * Time.Minute }).catch(() => null);
		await sent.delete().catch(() => null);

		return interaction && results[Number(interaction.customId)];
	}
}
