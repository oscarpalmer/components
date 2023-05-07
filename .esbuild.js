import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as esbuild from 'esbuild';

const components = ['index', 'accordion', 'details', 'focus-trap', 'popover', 'splitter', 'switch', 'tooltip'];
const formats = ['cjs', 'esm', 'iife'];

const exports = {};

for (const component of components) {
	console.log('==', 'Building', component);

	for (const format of formats) {
		await esbuild.build({
			format,
			entryPoints: [`./src/${component}.ts`],
			bundle: true,
			minify: format === 'iife',
			outdir: `./dist/${format}`,
			platform: 'neutral',
			target: format === 'esm' ? 'esnext' : 'es2020',
		});
	}

	const key = component === 'index'
		? '.'
		: `./${component}`;

	exports[key] = {
		default: `./dist/iife/${component}.js`,
		import: `./dist/esm/${component}.js`,
		module: `./dist/esm/${component}.js`,
		require: `./dist/cjs/${component}.js`,
		script: `./dist/iife/${component}.js`,
	};

	const types = `./src/${component}.d.ts`;

	fs.exists((types), (exists) => {
		if (exists) {
			exports[key].types = types;
		}
	});
}

console.log();

childProcess.exec(`npm pkg set 'exports'='${JSON.stringify(exports)}' --json`);
