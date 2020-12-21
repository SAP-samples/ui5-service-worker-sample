# ui5-service-worker
UI5 service worker

## installation

Start local server with:
```bash
npm run start
```

Access url via
```bash
curl -k https://localhost:1337/static/main.js
```

In your app create a file called `sw.js` in your app's root folder
```javascript
importScripts("https://localhost:1337/static/ui5swlib.js");

self.worker.initFromManifest().then(() => {
	console.log("successfully initialized manifest");
});
```

Add service worker in html:

```html
<script>
    // service worker registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('service worker successfully registered');
            });
        });
    }
</script>
```

## configuration

### strategies
cache strategies must be distinct (regarding urls) otherwise the first configured one wins.

#### static
static cache which does not get updated. Cache Management has to be done manually.

```json
{
    "url": "https://localhost:8443/index",
    "type": "static"
}
```

#### ui5resource
cache which checks the UI5 version and updates the cache upon new version (uses sap-ui-version.json)

```json
{
    "url": "https://sapui5.hana.ondemand.com/resources",
    "type": "ui5resource"
}
```

#### application
cache which checks the application version and updates the cache upon new version (uses manifest.json)

```json
{
    "url": "https://localhost:8443",
    "type": "application"
}
```

with params:

e.g. if `initialRequestEndings` differs from default: `["/index.html"]`

```json
{
    "url": "https://localhost:8443",
    "type": "application",
    "initialRequestEndings": ["/"]
}
```

`manifestRootUrl` can also be specified, if the manifest.json url is different from `/manifest.json`


#### precache
caches urls and assigns them a version. Cache gets filled before the application starts.
The cache can be manually invalidated by increasing the configured version number.
The urls must be resource urls.

```json
{
    "urls": [
        "https://localhost:8443/controller/App.controller.js",
        "https://localhost:8443/view/App.view.xml"
    ],
    "version": "1.2.3",
    "type": "precache"
}
```

### init from manifest.json

this will precache 2 urls `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`
and use a static cache for `https://localhost:8443/index`
and a resource cache which checks the version for updates coming from `https://sapui5.hana.ondemand.com/resources`


```json
{
	"_version": "1.12.0",
	"sap.app": {
		"id": "ABC",
		"title": "SW Demo",
		"description": "Demo of SW usage",
		"applicationVersion": {
			"version": "1.2.27"
		},
		"serviceWorker": {
			"file" : "sw.js",
			"config": [
				{
					"url": "https://localhost:8443/index",
					"type": "static"
				},
				{
					"url": "https://sapui5.hana.ondemand.com/resources",
					"type": "ui5resource"
				},
				{
					"urls": [
						"https://localhost:8443/controller/App.controller.js",
						"https://localhost:8443/view/App.view.xml"
					],
					"version": "1.2.3",
					"type": "precache"
				}
			]
		}
	}
}
```


### init in service worker (sw.js)

this will precache 2 urls `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`
and use a static cache for `https://localhost:8443/index`
and a resource cache which checks the version for updates coming from `https://sapui5.hana.ondemand.com/resources`

```javascript
self.worker.init([{
	urls: [
		"https://localhost:8443/controller/App.controller.js",
		"https://localhost:8443/view/App.view.xml"
	],
	version: "1.2.3",
	type: "precache"
}, {
	url: "https://localhost:8443/index",
	type: "static"
}, {
	url: "https://sapui5.hana.ondemand.com/resources",
	type: "ui5resource"
}]).then(() => {
	console.log("successfully initialized");
});
```
