# Integrating service worker into own UI5 apps

The following steps describe in detail, how a possible integration of the ui5-service-worker sample implementation could be achieved for own UI5 applications.

*DISCLAIMER*: You have to figure out what parts and how to adopt best for your own productive applications.


## Create UI5 service worker library
1. Build the ui5-service-worker sub project:
    ```shell
    npm run build-service-worker
    ```

1. Result is a minified bundle containing the ui5-service-worker:
    ```shell
    ls ui5-service-worker/dist/ui5swlib.js
    ```

1. Copy the ui5-service-worker bundle (`ui5swlib.js`) into the folder structure of your own project, e.g. as
`webapp/lib/ui5swlib.js`

## Configure app version and service worker in manifest

The UI5 service worker requires an application version to be set in the manifest in order to react on application changes. It is set via `sap.app > applicationVersion`.
It also requires the service worker cache configuration for the sources in `sap.app > serviceWorker > config`.

- `manifest.json`
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
                        "url": "https://openui5.hana.ondemand.com/resources",
                        "type": "ui5resource"
                    }
                ]
            }
        }
    }
    ```

#### Cache Configuration

The service worker cache configuration is done in `sap.app > serviceWorker > config`.
It contains an array of caches; each consists of the cache type and a URL or pattern, respectively. The URL/pattern defines for which resources the cache should be applied.

In the given example, cache type `application` is set for local application resources. If resources come from CDN, `ui5resource` should be used as a cache type.

The types use different mechanisms to check if cached resources must be updated.
Type `application` uses `applicationVersion` in the `manifest.json`, whereas `ui5resource` uses the version provided by `sap-ui-version.json`.

Resources coming from URLs which start with `http://localhost:8080` use the `application` cache.
Resources coming from URLs which start with `https://openui5.hana.ondemand.com/resources` use the `ui5resource` cache.
Each cache has its own versioning and the type of cache defines the specific update strategy.
For instance, if a new application version was released, the `ui5resource` cache is unaffected whereas the `application` cache gets updated.


If application as well as UI5 resources are released with one version, and for instance both are served by `localhost`, a single configuration entry makes most sense:
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

## Add service worker `sw.js` to webapp root
Additionally, a `sw.js` file is required in the webapp root folder:
- `sw.js`
    ```js
    importScripts("lib/ui5swlib.js");

    self.worker.initFromManifest().then(() => {
        console.log("successfully initialized manifest");
    });
    ```

## Add register script `regsw.js` to webapp root
Add the `regsw.js` that will register the service worker:
- `regsw.js`
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

## Register service worker at startup
Finally, the registration must be included into the startup file before any other script, e.g. early into the `<head>` section of the `index.html`:
- `index.html`
    ```html
    <script src="regsw.js"/>
    ```

## Verification
1. The network trace should show the service worker to serve the resources - after they were retrieved initially by regular requests.
1. New local storage caches should be present, which contain the cached resources.


# Additional Setup

## (Optional) Use  public CDN for the UI5 library
In order to load UI5 library resources from CDN:
- `index.html`
    ```html
    <script id="sap-ui-bootstrap"
        src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
        ... />
    ```

## https and async required

1. The service worker can only intercept async requests.
    Configure your UI5 project accordingly, such that only async requests are used. Consult the UI5 framework documentation for more information, e.g.
    * [Use Asynchronous Loading](https://openui5.hana.ondemand.com/#/topic/676b636446c94eada183b1218a824717)
    * [Is Your Application Ready for Asynchronous Loading?](https://openui5.hana.ondemand.com/topic/493a15aa978d4fe9a67ea9407166eb01)
    * [Performance Checklist](https://openui5.hana.ondemand.com/#/topic/9c6400eb7dc145b78e94a81e6e390780)

1. Additionally, it only works in combination with https. See for instance:
    *  [Using Service Workers](https://developer.mozilla.org/docs/Web/API/Service_Worker_API/Using_Service_Workers)
