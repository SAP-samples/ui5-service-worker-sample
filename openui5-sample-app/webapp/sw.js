importScripts("lib/ui5swlib.js");

self.worker.initFromManifest().then(() => {
	console.log("successfully initialized manifest");
});
