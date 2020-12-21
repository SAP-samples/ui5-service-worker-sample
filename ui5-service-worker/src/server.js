var express = require('express');
var https = require('https');
var app = express();
var path = require('path');
var getDevelopmentCertificate = require('devcert-sanscache');

app.use('/static', express.static(path.join(__dirname, '..', 'dist')));

getDevelopmentCertificate('ui5swlib').then(({cert, key}) => {
	https.createServer({cert, key}, app).listen(1337);
	console.log("running on 1337");
});