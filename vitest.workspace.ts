import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
	"packages/*",
	{
		test: {
			include: ["adapters/**/*.spec.ts"],
			name: "adapters",
			environment: "node",
			hookTimeout: 30000,
		},
	},
	{
		test: {
			include: ["tests/test-utils/**/*.spec.ts"],
			name: "test-helper",
			environment: "node",
		},
	},
	"plugins/*",
	//'test/*/vitest.config.ts',
]);
