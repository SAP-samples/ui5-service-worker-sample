# How was the integration done

## Build the service worker lib manually
Build the ui5-service-worker
```shell
npm run build-service-worker
```

Result is a minified bundle containing the ui5-service-worker:
```shell
ls ui5-service-worker/dist/ui5swlib.js
```

Copy the ui5-service-worker bundle into a lib folder in the openui5-sample-app
```shell
mkdir webapp/lib && cp ../ui5-service-worker/dist/ui5swlib.js webapp/lib/ui5swlib.js
```

### Add version information and service worker configuration to manifest.json
Service worker requires an application version to be set in the manifest in order to react on application changes.
It requires a configuration for the sources and the types of caches to be configured in `sap.app > serviceWorker > config`.
Set the `sap.app > applicationVersion` in the manifest.json

manifest.json
```json
{
    "sap.app": {
        "id": "sap.ui.demo.todo",
        "type": "application",
        "applicationVersion": {
            "version": "0.2.0"
        },
        "serviceWorker": {
            "file" : "sw.js",
            "config": [
                {
                    "url": "http://localhost:8080",
                    "type": "application"
                },
                {
                    "url": "https://sapui5.hana.ondemand.com/resources",
                    "type": "ui5resource"
                }
            ]
        }
    }
}
```

Here `application` is set for local application resources.
When resources are coming from the CDN `ui5resource` should be used as cache type.
The types use different mechanisms to check if cached resources must be updated.
Type `application` uses the `applicationVersion` in the `manifest.json`
while `ui5resource` uses version provided in the `sap-ui-version.json`.


This means, the application has an own versioning as well as the ui5resource.
If there is only one version for both and e.g. both are served using the localhost
a single configuration entry makes most sense:
```json
{
 "serviceWorker": {
        "file" : "sw.js",
        "config": [
            {
                "url": "http://localhost:8080",
                "type": "application"
            }
        ]
    }
}
```

### Add service worker sw.js to webapp root
Additionally, a `sw.js` file is required:
```js
importScripts("lib/ui5swlib.js");

self.worker.initFromManifest().then(() => {
	console.log("successfully initialized manifest");
});
```

### Add script to register service worker regsw.js to webapp root
Add `regsw.js` to register the service worker
```js
// service worker registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function() {
			console.log('service worker successfully registered');
		});
	});
}
```

### Register service worker using regsw.js in index.html
Finally, the registration must be included in the `index.html` before every other script

```html
<script src="regsw.js"></script>
```

### (Optional) Use the public CDN for the UI5 library
Note:
to load UI5 library resources from CDN use in index.html
```html
<script id="sap-ui-bootstrap"
    src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
```

### Verification
1. In the network trace the service worker should serve the resources after they were requested initially
1. Local storage caches should be present which contain the cached resources