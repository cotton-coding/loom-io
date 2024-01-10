import dts from 'bun-plugin-dts';

await Bun.build({
	entrypoints: ['./app.ts'],
	outdir: './dist',
	minify: true,
	plugins: [
		dts()
	]
});