import type { InitialOptionsTsJest } from 'ts-jest';

export default {
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': 'esbuild-jest'
	}
} as InitialOptionsTsJest;
