await Bun.build({
	entrypoints: ['./app.ts'],
	outdir: './dist',
	sourcemap: 'external',
	minify: true,
	splitting: true,
});