import CacheStrategy from "./CacheStrategy";
import Version from "../Version";

/**
 * This caching strategy initially caches the given set of urls
 */
export default class PreCacheStrategy extends CacheStrategy {
	/**
	 * sample config contains url and version
	 * @param config, e.g. {version: "1.0.0", urls: ["http://localhost/index.html"]}
	 * @param config.urls, e.g. ["http://localhost/index.html"]
	 * @param config.version, e.g. "1.0.0"
	 */
	constructor(config) {
		super(config.urls);
		this.aUrls = config.urls;
		this.sVersion = config.version;
		this._isInitial = true;
	}

	isInitialRequest(url) {
		// since there is not re-initialization
		// hence only initialize it once in the service worker lifetime
		if (this._isInitial) {
			this._isInitial = false;
		}
		return this._isInitial;
	}

	async fetchVersion() {
		return Version.fromString(this.sVersion, "PRE");
	}

	async init() {
		await super.init();

		const pFetches = this.aUrls.map(oUrl => {
			return this.handleOnline(this.getCache(), oUrl);
		});

		await Promise.all(pFetches);
	}
}
