// service worker registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		'use strict';

		navigator.serviceWorker.register('/sw.js').then(function () {
			console.log('service worker successfully registered');
		});
	});
}
