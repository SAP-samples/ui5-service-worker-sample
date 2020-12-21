const path = require('path');

module.exports = {
	entry: './src/worker/CoreServiceWorker.js',
	mode: 'production',
	output: {
		library: 'worker',
		libraryTarget: 'self',
		filename: 'ui5swlib.js',
		path: path.resolve(__dirname, 'dist')
	}
};