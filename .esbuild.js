import * as childProcess from 'child_process';
import * as esbuild from 'esbuild';

const components = [
	'index',
	'accordion',
	'colour-picker',
	'dialog',
	'disclosure',
	'focus-trap',
	'popover',
	'splitter',
	'tooltip',
];

const formats = ['esm', 'iife'];

const exports = {};

for (const component of components) {
	console.log('==', 'Building', component);

	for (const format of formats) {
		await esbuild.build({
			format,
			bundle: true,
			entryPoints: [`./src/${component}.js`],
			legalComments: 'none',
			mainFields: ['module', 'main'],
			minify: format === 'iife',
			outdir: `./dist/${format}`,
			platform: 'neutral',
			target: 'es2020',
		});
	}

	const key = component === 'index' ? '.' : `./${component}`;

	exports[key] = {
		types: `./src/${component}.d.ts`,
		import: `./dist/esm/${component}.js`,
		default: `./dist/iife/${component}.js`,
	};

	if (components.indexOf(component) === components.length - 1) {
		console.log('');
	}
}

childProcess.exec(`npm pkg set 'exports'='${JSON.stringify(exports)}' --json`);
