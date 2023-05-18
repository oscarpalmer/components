import * as childProcess from 'child_process';
import * as esbuild from 'esbuild';

const components = ['index', 'accordion', 'details', 'focus-trap', 'popover', 'splitter', 'switch', 'tooltip'];
const formats = ['esm', 'iife'];

const exports = {};

for (const component of components) {
	console.log('==', 'Building', component);

	for (const format of formats) {
		await esbuild.build({
			format,
			entryPoints: [`./src/${component}.js`],
			bundle: true,
			minify: format === 'iife',
			outdir: `./dist/${format}`,
			platform: 'neutral',
			target: 'es2020',
		});
	}

	const key = component === 'index'
		? '.'
		: `./${component}`;

	exports[key] = {
		types: `./src/${component}.d.ts`,
		import: `./dist/esm/${component}.js`,
		default: `./dist/iife/${component}.js`,
	};
}

childProcess.exec(`npm pkg set 'exports'='${JSON.stringify(exports)}' --json`);
