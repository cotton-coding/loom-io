import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	// 'packages/*',
	'adapters/*',
	{
		test: {
			include: ['tests/test-utils/**/*'],
			name: 'test-helper',
			environment: 'node'
		}
	}
	//'plugins/*',
	//'test/*/vitest.config.ts',
]);