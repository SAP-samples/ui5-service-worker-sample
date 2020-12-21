![UI5 logo](http://openui5.org/images/OpenUI5_new_big_side.png)

# ui5-service-worker-sample
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/ui5-service-worker-sample)](https://api.reuse.software/info/github.com/SAP-samples/ui5-service-worker-sample)

## Description

This sample demonstrates the use of the ui5-service-worker within the openui5-sample-app.
It can be used as an example for integrating a service worker into the own UI5 freestyle app.


## Structure

The ui5-service-worker-sample consists of:
1. openui5-sample-app
    * Version: 0.2.0
    * Commit: dc366078faa147c193eda06ab10958e1330e5c20
1. ui5-service-worker
    * Version: 1.0.0

## Requirements

- [Node.js](https://nodejs.org/) Version 10 or later

## Download and Installation

1. Clone this repository and navigate into it
    ```sh
    git clone git@github.com:SAP-samples/ui5-service-worker-sample.git
    cd ui5-service-worker-sample
    ```
1. Install all dependencies
    ```sh
    npm install
    ```

1. Start a local server and run the application
    ```sh
    npm start
    ```
   
1. (Optional) Build the application and start a local server
    ```sh
    npm start-dist
    ```
   
1. Navigate your browser to
    1. http://localhost:8080/index.html
    1. http://localhost:8080/index-cdn.html

## Integration
Detailed information about the integration can be found in the
[Integration](./docs/integration.md) section.

## Configuration options
Additional configuration options for the ui5-service-worker can be found in the
[Configuration Section](./ui5-service-worker/README.md#configuration).

## Known Issues
No major bugs known.

## Contributing
In general the contributing guidelines of OpenUI5 also apply to this project. They can be found here:
https://github.com/SAP/openui5/blob/master/CONTRIBUTING.md

Some parts might not be relevant for this project (e.g. the browser-specific requirements like jQuery, CSS and accessibility in the "Contribution Content Guidelines") and the contribution process is easier (pull requests will be merged directly on GitHub).

## License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
