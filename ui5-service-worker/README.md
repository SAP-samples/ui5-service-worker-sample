# ui5-service-worker

This sample implementation of a UI5 service worker uses [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) API to intercept network requests. It also uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to cache the responses based on a given cache configuration.

The two most prominent cache configurations are `application`, which provides a cache specific for UI5 apps, and `ui5resource`, which provides a cache specific for UI5 library resources. Other configurations allow for `static` caches and `precache`.

## Installation

1. Start local server with
    ```bash
    npm run start
    ```

1. Access URL via
    ```bash
    curl -k https://localhost:1337/static/ui5swlib.js
    ```

1. Create a file called `sw.js` in your app's root folder
    - sw.js
    ```javascript
    importScripts("https://localhost:1337/static/ui5swlib.js");

    self.worker.initFromManifest().then(() => {
        console.log("successfully initialized manifest");
    });
    ```
1. Create a file called `regsw.js` in your app's root folder
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
1. Load `regsw.js` in your application's `index.html`:
    ```html
    <script src="regsw.js"></script>
    ```

## Configuration

The configuration can either be provided declaratively using `manifest.json` or programmatically after the service worker has been registered.
Inside this configuration several cache types can be configured to manage the cached resources.

### Configuration via manifest.json

In the service worker (file `sw.js`) the configuration can be initialized from the `manifest.json` using
```js
self.worker.initFromManifest();
```

The example below will *precache* two URLs `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`. Moreover, it uses a *static cache* for `https://localhost:8443/index`, and a *resource cache*, which checks the version for updates via `https://openui5.hana.ondemand.com/resources`

- `sw.js`
    ```js
    self.worker.initFromManifest();
    ```

- `manifest.json`
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
                        "url": "https://openui5.hana.ondemand.com/resources",
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


### Programmatic Configuration

In the service worker (file `sw.js`) the configuration can be initialized programmatically using
```js
self.worker.init([]);
```

The example below will *precache* two URLs `https://localhost:8443/controller/App.controller.js` and `https://localhost:8443/view/App.view.xml`. It uses a *static cache* for `https://localhost:8443/index`
and a *resource cache*, which checks the version for updates via `https://openui5.hana.ondemand.com/resources`

- `sw.js`
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
        url: "https://openui5.hana.ondemand.com/resources",
        type: "ui5resource"
    }]).then(() => {
        console.log("successfully initialized");
    });
    ```

### Cache Types
Various cache types can be configured for URLs using patterns. The individual type defines the cache update strategy to be used:
* `application`
* `ui5resource`
* `static`
* `precache`

_Note: An overlap of URLs is not supported and means that the first matching cache type is taken and others are ignored._


#### Type `application`
The cache type `application` uses a caching strategy, which checks the application version for the initial request and updates the cache upon new a version.
It uses field `sap.app > applicationVersion` in `manifest.json` for version comparison.

```json
{
    "url": "https://localhost:8443",
    "type": "application"
}
```

Additional configuration options:
The initial request is identified by the `initialRequestEndings` option, whose default is `["/index.html"]`. It can be overridden by specifying it explicitly:

```json
{
    "url": "https://localhost:8443",
    "type": "application",
    "initialRequestEndings": ["/"]
}
```

The `manifestRootUrl` may also be specified, if the URL to `manifest.json` is different from `/manifest.json`.

The resulting name of the cache starts with `app-`.

#### Type `ui5resource`
This type represents a cache, which checks the UI5 version and updates the cache upon new a version.
It uses field `version` in `sap-ui-version.json` for the version comparison.

```json
{
    "url": "https://openui5.hana.ondemand.com/resources",
    "type": "ui5resource"
}
```
The UI5 version is checked initially once a request to `/sap-ui-core.js` is performed. This avoids frequent checking for a new version.

The resulting name of the cache starts with `resources-`.


#### Type `static`
This type represents a static cache, which does not get updated. Cache management is to be done manually.

```json
{
    "url": "https://localhost:8443/index",
    "type": "static"
}
```
All resources starting with the configured URL are handled by this cache type.
For instance, URLs starting with `"https://localhost:8443/index"`, `"https://localhost:8443/index.js"`, `"https://localhost:8443/index/my.js"`, etc.

The resulting name of the cache starts with `STATIC-`.

#### Type `precache`
This type caches URLs and assigns a version to them. The cache gets filled before the application starts.
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
