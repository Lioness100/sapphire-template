import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import 'dotenv/config';

import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { embed, error } from '#utils/embeds';
import { container } from '@sapphire/framework';
import { userMention } from '@discordjs/builders';

// assign helper embed methods to `container`
// for ease of accessibility
container.embed = embed;
container.error = error;

// less aggressive reply than default
PaginatedMessage.wrongUserInteractionReply = (targetUser) => `❌ Only ${userMention(targetUser.id)} can use these buttons!`;
