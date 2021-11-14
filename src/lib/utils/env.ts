import type { IEnv } from '#types/IEnv';
import env from 'env-var';

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { get: getEnv, from: fromEnv } = env.from(process.env as unknown as IEnv);
