import type { LoomFSPlugin } from '../types.js';

export default {
	type: 'jsonConverter',
	extentions: ['json'],
	parse: JSON.parse,
	stringify: JSON.stringify
} satisfies LoomFSPlugin;