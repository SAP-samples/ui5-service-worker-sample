import CacheStrategy from "./CacheStrategy";
import Version from "../Version";

/**
 * Caches everything and updates the cache with each request in the background
 * Cache will have the name "0.0.0-NETWORKUPDATE"
 */
export default class CacheNetworkUpdateStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		this._isInitial = true;
	}

	async fetchVersion() {
		return Version.fromString("0.0.0", "NETWORKUPDATE");
	}

	async handleOnline(cache, request) {
		let response = await cache.get(request);

		if (!response) {
			// await fetch
			response = await self.fetch(request);
			cache.put(request, response);
		} else {
			// async fetch
			self.fetch(request).then((response) => {
				cache.put(request, response);
			});
		}

		return response;
	}

	isInitialRequest(url) {
		// since there is not re-initialization
		// hence only initialize it once in the service worker lifetime
		if (this._isInitial) {
			this._isInitial = false;
		}
		return this._isInitial;
	}
}
