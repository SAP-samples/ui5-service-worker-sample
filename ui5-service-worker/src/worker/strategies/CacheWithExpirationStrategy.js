import CacheStrategy from "./CacheStrategy";
import Version from "../Version";

/**
 * Expires after given amount of time `timeInMs` after last request has been made
 * Cache will have the name "0.0.0-TIMED"
 */
export default class CacheWithExpirationStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		this._isInitial = true;
		this._timeInMs = config.timeInMs;
	}

	async fetchVersion() {
		return Version.fromString("0.0.0", "TIMED");
	}

	isExpired() {
		var currentTime =  new Date().getTime();
		return currentTime - this.lastAccessTime < this._timeInMs;
	}

	async handleOnline(cache, request) {
		let response = await cache.get(request);

		// if there is no response or is expired
		if (!response || this.isExpired()) {
			// await fetch
			response = await self.fetch(request);
			cache.put(request, response);
		}

		this.lastAccessTime = new Date().getTime();
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
