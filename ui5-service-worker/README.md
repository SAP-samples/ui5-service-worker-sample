# ui5-service-worker
The UI5 service worker is a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) which intercepts network requests and uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to cache the responses based on a cache configuration.
The most prominent cache configurations are `application` which provides a UI5 app specific cache and `ui5resource` which provides a UI5 library resources specific cache.

## installation

1. Start local server with:
    ```bash
    npm run start
    ```

1. Access url via
    ```bash
    curl -k https://localhost:1337/static/ui5swlib.js
    ```

1. In your app create a file called `sw.js` in your app's root folder
    - sw.js
    ```javascript
    importScripts("https://localhost:1337/static/ui5swlib.js");
    
    self.worker.initFromManifest().then(() => {
        console.log("successfully initialized manifest");
    });
    ```
1. In your app create a file called `regsw.js` in your app's root folder
    - regsw.js
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
1. Load `regsw.js` in html:
    - index.html
    ```html
    <script src="regsw.js"></script>
    ```

## configuration

The configuration can be either provided using the `manifest.json` or programmatically after registering the service worker.
Inside this configuration several cache types can be configured to manage the cached resources.

### Initialize configuration from manifest.json

In the service worker (sw.js) the configuration ba initialized from the manifest.json using
```js
self.worker.initFromManifest();
```

The example below will precache 2 urls `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`
and use a static cache for `https://localhost:8443/index`
and a resource cache which checks the version for updates coming from `https://sapui5.hana.ondemand.com/resources`

- sw.js
    ```js
    self.worker.initFromManifest();
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
self.worker.init([]);
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

### cache types
Cache types can be configured for URLs using patterns.
The type defines the caching update strategy which is used.

_Note: An overlap of URLs is not supported and means that the first matching cache type is taken and others are ignored._


#### `application`
The cache type `application` uses a caching strategy where application version is checked for the initial request and updates the cache upon new version.
It uses field `sap.app>applicationVersion` in the `manifest.json` for the version comparison.

```json
{
    "url": "https://localhost:8443",
    "type": "application"
}
```

Additional configuration options:
The initial request is identified by the initialRequestEndings option which is default: `["/index.html"]`
It can be overridden by manually specifying it:

```json
{
    "url": "https://localhost:8443",
    "type": "application",
    "initialRequestEndings": ["/"]
}
```

The `manifestRootUrl` can also be specified, if the manifest.json url is different from `/manifest.json`

The resulting name of the cache starts with `app-`.

#### `ui5resource`
This type represents a cache which checks the UI5 version and updates the cache upon new version.
It uses field `version` in sap-ui-version.json for the version comparison.

```json
{
    "url": "https://sapui5.hana.ondemand.com/resources",
    "type": "ui5resource"
}
```
The UI5 version is checked initially once a request to `/sap-ui-core.js` is performed.
This avoids constant checking for a new version.
The resulting name of the cache starts with `resources-`.


#### `static`
This type represents a static cache which does not get updated. Cache Management has to be done manually.

```json
{
    "url": "https://localhost:8443/index",
    "type": "static"
}
```
All resources starting with the configured URL are handled by this cache type.
e.g. URLs starting with: `"https://localhost:8443/index"`, e.g. `"https://localhost:8443/index.js"`, `"https://localhost:8443/index/my.js"`
The resulting name of the cache starts with `STATIC-`.

#### `precache`
This type caches urls and assigns them a version. The cache gets filled before the application starts.
The cache can be manually invalidated by increasing the configured version number.
The URLs must be absolute resource URLs.

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

The resulting name of the cache starts with `PRE-`.
