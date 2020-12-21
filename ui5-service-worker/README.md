# ui5-service-worker
UI5 service worker

## installation

Start local server with:
```bash
npm run start
```

Access url via
```bash
curl -k https://localhost:1337/static/ui5swlib.js
```

In your app create a file called `sw.js` in your app's root folder
```javascript
importScripts("https://localhost:1337/static/ui5swlib.js");

self.worker.initFromManifest().then(() => {
	console.log("successfully initialized manifest");
});
```
In your app create a file called `regsw.js` in your app's root folder
```javascript
// service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(() => {
            console.log('service worker successfully registered');
        });
    });
}
```
Load `regsw.js` in html:

```html
<script src="regsw.js"></script>
```

## configuration

The configuration can be either provided using the manifest.json or programmatically after registering the service worker.
The ui5-service-worker provides several configuration options to manage the cached resources.

### cache strategies
Cache strategies can be configured for URLs using patterns.
A URL should only match one pattern associated with one strategy.
An overlap is not supported and means that the first match strategy is taken and others are ignored.

#### static
static cache which does not get updated. Cache Management has to be done manually.

```json
{
    "url": "https://localhost:8443/index",
    "type": "static"
}
```
The indicator is the start of the URL,
e.g. URLs starting with: `"https://localhost:8443/index"`, e.g. `"https://localhost:8443/index.js"`, `"https://localhost:8443/index/my.js"`
The resulting localStorage's name starts with `STATIC-`.


#### ui5resource
cache which checks the UI5 version and updates the cache upon new version (uses `version` in sap-ui-version.json)

```json
{
    "url": "https://sapui5.hana.ondemand.com/resources",
    "type": "ui5resource"
}
```
The UI5 version is checked once a request to `/sap-ui-core.js` is performed.
This avoids constant checking for a new version.
The resulting localStorage's name starts with `resources-`.

#### application
cache which checks the application version and updates the cache upon new version (uses `sap.app>applicationVersion` in manifest.json)

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


The application version is checked once a request to the value from `initialRequestEndings` is performed.
This avoids constant checking for a new version.
The resulting localStorage's name starts with `app-`.

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

The resulting localStorage's name starts with `PRE-`.

### Initialize configuration from manifest.json

In the service worker (sw.js) the configuration ba initialized from the manifest.json using
```js
self.worker.initFromManifest()
```

The example below will precache 2 urls `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`
and use a static cache for `https://localhost:8443/index`
and a resource cache which checks the version for updates coming from `https://sapui5.hana.ondemand.com/resources`

- sw.js
```js
self.worker.initFromManifest()
```
- manifest.json
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


### Initialize configuration programmatically

In the service worker (sw.js) the configuration ba initialized programmatically using
```js
self.worker.init([])
```

The example below will precache 2 urls `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`
and use a static cache for `https://localhost:8443/index`
and a resource cache which checks the version for updates coming from `https://sapui5.hana.ondemand.com/resources`

- sw.js
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
