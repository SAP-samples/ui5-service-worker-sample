import CacheStrategy from "./CacheStrategy.js";
import Version from "../Version.js";

/**
 * Caches everything without the ability to reset the cache
 * Cache will have the name "0.0.0-ALL"
 */
export default class CacheAllStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		this._isInitial = true;
		this.name = config.name || "STATIC";
	}

	async fetchVersion() {
		return Version.fromString("0.0.0", this.name);
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
