import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import 'dotenv/config';

import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { embed, error } from '#utils/embeds';
import { container } from '@sapphire/framework';
import { userMention } from '@discordjs/builders';

Object.assign(container, { embed, error });
PaginatedMessage.wrongUserInteractionReply = (targetUser) => `❌ Only ${userMention(targetUser.id)} can use these buttons!`;
