/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { none, type Option, some } from '@sapphire/framework';

export const enum CustomId {
	Arbitrary = '**'
}

// `Resolver`s will be used with different data types to serialize parameters into the string. This setup assumes the
// custom ID will be under 100 characters and doesn't do any massive compression because I haven't found a need for
// that.
interface Resolver {
	// `create` will serialize and return a string.
	create: (param: any, ...other: any) => string;
	// `parse` will deserialize the string.
	parse: (param: string, ...other: any) => any;
}

const optional = <T extends ResolverKey>(resolver: T): `${T}?` => {
	return `${resolver}?` as const;
};

const ParamType = {
	InteractionId: 'string'
} satisfies Record<string, ResolverKey>;

const customIdParams = {
	[CustomId.Arbitrary]: [optional(ParamType.InteractionId)] as const
} as const satisfies Partial<Record<CustomId, readonly ResolverKey[]>>;

const baseResolvers = {
	string: { create: (param: string) => param, parse: (param) => param },
	boolean: { create: (param: boolean) => (param ? '1' : '0'), parse: (param) => param === '1' },
	number: { create: (param: number) => param.toString(), parse: Number }
} satisfies Record<string, Resolver>;

// Prevent circular references.
const resolvers = baseResolvers;
const customIdSeparator = '|' as const;

const customIdResolver = {
	create: <T extends CustomId>(param: T, ...args: CreateParams<T>) => {
		const schema = customIdParams[param as keyof typeof customIdParams];
		if (!schema) {
			return param;
		}

		const createdArgs = args.map((arg, idx) => {
			if (arg === undefined) {
				return '';
			}

			const resolverId = schema[idx];
			const resolverIdx = resolverId.endsWith('?') ? resolverId.slice(0, -1) : resolverId;
			const resolver = resolvers[resolverIdx as keyof typeof resolvers] as Resolver;

			if (!resolver) {
				return '';
			}

			if (Array.isArray(arg)) {
				const [param, ...other] = arg as any;
				return resolver.create(param, ...other);
			}

			return resolver.create(arg);
		});

		return [param, ...createdArgs].join(customIdSeparator);
	},
	// This function will double as a check that this interaction has the custom ID(s) you're looking for.
	parse: <T extends CustomId>(
		param: string,
		options: { extras?: ParseExtras<T>; filter?: T[]; parseArgs?: boolean }
	): ParsedCustomId<T> => {
		const [name, ...args] = param.split(customIdSeparator) as [T, ...string[]];

		if (options.filter && !options.filter.includes(name)) {
			return none;
		}

		if (!args.length || options.parseArgs === false) {
			return some([name, []] as any);
		}

		const parsedArgs = args.map((arg, idx) => {
			if (!arg) {
				// eslint-disable-next-line array-callback-return
				return;
			}

			const resolverId = customIdParams[name as keyof typeof customIdParams][idx];
			const resolverIdx = resolverId.endsWith('?') ? resolverId.slice(0, -1) : resolverId;
			const resolver = resolvers[resolverIdx as keyof typeof resolvers] as Resolver;

			const extraParams = (options.extras as any)?.[resolverId]?.[0];
			return resolver.parse(arg, ...(Array.isArray(extraParams) ? extraParams : [extraParams]));
		});

		return some([name, parsedArgs] as any);
	}
} satisfies Resolver;

export const createCustomId = customIdResolver.create;
export const parseCustomId = customIdResolver.parse;
export const parseCustomIdArgs = <T extends CustomId>(
	param: string,
	options: { extras?: ParseExtras<T>; filter?: T[]; parseArgs?: boolean }
): ParsedCustomIdArgs<T> => parseCustomId(param, options).map(([, args]) => args);

// Types to resolve the types from resolver names. Read if you dare.
type MethodType = 'params' | 'return' | 'parse-args';
type GetParameters<A extends any[]> = A['length'] extends 1 ? A[0] : A[0] | A;
type ResolverParam<R extends Resolver, Method extends MethodType> = Method extends 'params'
	? GetParameters<Parameters<R['create']>>
	: Method extends 'parse-args'
		? Parameters<R['parse']> extends [any, ...infer U]
			? GetParameters<U>
			: never
		: ReturnType<R['parse']>;

type CustomIdParam<T extends ResolverKey, Method extends MethodType> = T extends `${infer T2}?`
	? [param?: ResolverParam<(typeof resolvers)[T2 & keyof typeof resolvers], Method>]
	: [param: ResolverParam<(typeof resolvers)[T & keyof typeof resolvers], Method>];

type ResolverKey = `${keyof typeof resolvers}${'?' | ''}`;
type CustomIdParams<T extends readonly ResolverKey[], Method extends MethodType> = T extends readonly [
	infer First,
	...infer Tail
]
	? Tail extends ResolverKey[]
		? [...CustomIdParam<First & ResolverKey, Method>, ...CustomIdParams<Tail, Method>]
		: never
	: [];

type CreateParams<T extends CustomId> = T extends keyof typeof customIdParams
	? CustomIdParams<(typeof customIdParams)[T], 'params'>
	: never;

type ParseExtras<T extends CustomId> = T extends keyof typeof customIdParams
	? { [K in (typeof customIdParams)[T][number]]?: CustomIdParam<K, 'parse-args'> | undefined }
	: never;

type ParsedCustomId<T extends CustomId> = Option<
	[T, T extends keyof typeof customIdParams ? CustomIdParams<(typeof customIdParams)[T], 'return'> : []]
>;

type ParsedCustomIdArgs<T extends CustomId> =
	ParsedCustomId<T> extends Option<[any, infer Args]> ? Option<Args> : never;
