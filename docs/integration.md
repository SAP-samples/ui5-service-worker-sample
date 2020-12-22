# How to integrate the service worker into the own UI5 app

## ui5 service worker library (ui5swlib.js)
1. Build the ui5-service-worker
    ```shell
    npm run build-service-worker
    ```

1. Result is a minified bundle containing the ui5-service-worker:
    ```shell
    ls ui5-service-worker/dist/ui5swlib.js
    ```

1. Copy the ui5-service-worker bundle into own project folder structure, e.g.
```webapp/lib/ui5swlib.js```

## Add version information and service worker configuration to manifest.json
The UI5 service worker requires an application version to be set in the manifest in order to react on application changes.
It also requires the service worker cache configuration for the sources in `sap.app > serviceWorker > config`.
The application version can be set in `sap.app > applicationVersion` in the manifest.

- manifest.json
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

**Service Worker Cache configuration**

The service worker cache configuration is done in `sap.app > serviceWorker > config`.
It contains an array of caches, each consists of the type of cache and a URL/pattern.
The URL/pattern defines for which resources the cache should be applied.

In the given example type `application` is set for local application resources.
When resources are coming from the CDN `ui5resource` should be used as cache type.
The types use different mechanisms to check if cached resources must be updated.
Type `application` uses the `applicationVersion` in the `manifest.json`
while `ui5resource` uses version provided in the `sap-ui-version.json`.

Resources coming from URLs which start with `http://localhost:8080` using the `application` cache.
Resources coming from URLs which start with `https://sapui5.hana.ondemand.com/resources` using the `ui5resource` cache.
Each cache has its own versioning and the type of cache define the update strategy.
E.g. if a new application version was released, the `ui5resource` cache is unaffected while the `application` cache gets updated.


If application as well as UI5 resources are released with one version e.g. both are served using `localhost`
a single configuration entry makes most sense:
- manifest.json
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

## Add service worker sw.js to webapp root
Additionally, a `sw.js` file is required in the webapps root folder:
- sw.js
    ```js
    importScripts("lib/ui5swlib.js");
    
    self.worker.initFromManifest().then(() => {
        console.log("successfully initialized manifest");
    });
    ```

## Add script to register service worker regsw.js to webapp root
Add `regsw.js` to register the service worker
- regsw.js
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

## Register service worker using regsw.js in index.html
Finally, the registration must be included in the `index.html` before every other script in the `<head>`
- index.html
    ```html
    <script src="regsw.js"></script>
    ```

## Verification
1. In the network trace the service worker should serve the resources after they were requested initially
1. Local storage caches should be present which contain the cached resources


# Additional setup

## (Optional) Use the public CDN for the UI5 library
Note:
to load UI5 library resources from CDN use in `index.html`
- index.html
    ```html
    <script id="sap-ui-bootstrap"
        src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
        ...
    ```
  
## Https and Async required
1. The service worker can only intercept async requests.
    Configure UI5 accordingly such that async requests are used:
    https://sapui5.hana.ondemand.com/#/topic/9c6400eb7dc145b78e94a81e6e390780

1. Additionally it only works in combination with https
    https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers