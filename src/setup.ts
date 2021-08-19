import '@sapphire/plugin-editable-commands/register';
import 'dotenv/config';
import 'reflect-metadata';
import '#lib/env/index';

import { container } from '@sapphire/framework';
import * as embedUtils from '#factories/embeds';

Object.assign(container, embedUtils);
