var file = "sw2.js"; // comes from manifest

/*
 * sw2.js content
 * importScripts("http://localhost:8080/resources/sap/ui/worker/CoreServiceWorker.js");
 *
 *
 * loading subsequent modules:
 * * bundle in one file
 * * after importing load facade function and give url to load to it worker.load("http://localhost:8080/resources/sap/ui/worker/")
 */

// Check that service workers are registered
if ("serviceWorker" in navigator) {
	// Use the window load event to keep the page load performant
	window.addEventListener("load", event => {
		navigator.serviceWorker.register("/" + file).then(regsw => {});
	});
}
