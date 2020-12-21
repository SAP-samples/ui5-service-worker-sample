const path = require('path');

module.exports = {
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