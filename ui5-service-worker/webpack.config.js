import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	entry: './src/worker/CoreServiceWorker.js',
	mode: 'production',
	output: {
		library: 'worker',
		libraryTarget: 'self',
		filename: 'ui5swlib.js',
		path: path.resolve(__dirname, 'dist')
	}
};