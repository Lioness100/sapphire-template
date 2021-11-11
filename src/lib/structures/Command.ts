import type { Args as SapphireArgs, CommandContext, CommandOptions, PieceContext } from '@sapphire/framework';
import { Command as SapphireCommand, UserError } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/v9';

// type Compute<T> = { [P in keyof T]: T[P] };
// type ArgumentDescriptions<U extends string /* command usage */> = `${U} ` extends `${
// 	| `<${infer Name}> `
// 	| `[${infer Name}] `
// 	| `--${infer Name} `}${infer Rest}`
// 	? Compute<{ [P in Name extends `${infer Flag}=${string}` ? Flag : Name]: string } & ArgumentDescriptions<Rest>>
// 	: unknown;

export abstract class Command extends SapphireCommand {
	public usages?: string[];
	public examples?: string[];
	public tip?: string;

	public constructor(context: PieceContext, options: Command.Options) {
		super(context, {
			generateDashLessAliases: true,
			requiredClientPermissions: (options.requiredClientPermissions ?? 0n) | PermissionFlagsBits.EmbedLinks,
			...options
		});

		this.usages = options.usages;
		this.examples = options.examples;
		this.tip = options.tip;
	}

	public error(message: string | UserError, context?: unknown): never {
		throw typeof message === 'string' ? new UserError({ message, context, identifier: 'CustomUserError' }) : message;
	}

	public get client() {
		return this.container.client;
	}

	public get embed() {
		return this.container.embed;
	}
}

export namespace Command {
	export type Args = SapphireArgs;
	export type Context = CommandContext;

	export interface Options extends Omit<CommandOptions, 'requiredClientPermissions' | 'requiredUserPermissions'> {
		requiredClientPermissions?: bigint;
		requireUserPermissions?: bigint;
		usages?: string[];
		examples?: string[];
		tip?: string;
	}
}
