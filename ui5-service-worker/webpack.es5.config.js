const path = require('path');

module.exports = {
	entry: './src/worker/CoreServiceWorker.js',
	mode: 'production',
	output: {
		library: 'worker',
		libraryTarget: 'self',
		filename: 'ui5swlibes.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
};