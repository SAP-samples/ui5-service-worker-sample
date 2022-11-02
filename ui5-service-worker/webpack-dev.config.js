import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	entry: './src/worker/CoreServiceWorker.js',
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		library: 'worker',
		libraryTarget: 'self',
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	},
	optimization: {
		minimize: false
	}
};