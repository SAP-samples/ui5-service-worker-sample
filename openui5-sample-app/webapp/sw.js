// eslint-disable-next-line no-undef
importScripts("lib/ui5swlib.js");

self.worker.initFromManifest().then(() => {
	"use strict";

	console.log("successfully initialized manifest");
});
