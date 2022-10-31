import CacheManager from "../CacheManager.js";

/**
 * CacheStrategy base class
 *
 * Represents a versioned cache.
 * Each strategy has one version specific cache
 */
export default class CacheStrategy {
	constructor(matcher) {
		this._version = undefined;
		this._matcher = matcher;
	}

	get version() {
		return this._version;
	}

	/**
	 * @returns {boolean} whether or not browser is offline
	 */
	static isOffline() {
		return !navigator.onLine;
	}

	/**
	 * default matching logic
	 * @param url
	 * @returns {boolean} whether or not url matches
	 */
	matches(url) {
		if (Array.isArray(this._matcher)) {
			return this._matcher.includes(url);
		} else if (this._matcher instanceof RegExp) {
			return this._matcher.test(url);
		} else if (typeof this._matcher === "function") {
			return this._matcher(url);
		} else if (typeof this._matcher === "string") {
			return url.startsWith(this._matcher);
		} else {
			return false;
		}
	}

	/**
	 *
	 * @returns {Promise<Version>}
	 */
	async fetchVersion() {
		throw new Error("must be implemented by strategy");
	}

	/**
	 *
	 * @param url
	 * @returns {boolean}
	 */
	isInitialRequest(url) {
		throw new Error("must be implemented by strategy");
	}

	async init() {
		if (this.cache) {
			//only re-initialize if online
			if (!CacheStrategy.isOffline()) {
				await this.reinitialize();
			}
		} else {
			this._version = await this.fetchVersion();
			this.cache = await CacheManager.create({
				version: this.version.asString()
			});
		}
	}

	/**
	 * ensure the version is correct
	 * and cleanup previous versions
	 * @returns {Promise<void>}
	 */
	async reinitialize() {
		const prevVersion = this.version && this.version.asString();
		this._version = await this.fetchVersion();
		if (prevVersion !== this.version.asString()) {
			this.cache = await CacheManager.create({
				version: this.version.asString()
			});
		}
		await CacheManager.cleanup(this.version);
	}

	async applyStrategy(request) {
		if (!request || !(request instanceof self.Request)) {
			throw new Error("request is required");
		}

		// applies strategy
		const cache = this.getCache();

		if (CacheStrategy.isOffline()) {
			// offline strategy
			return await this.handleOffline(cache, request);
		} else {
			// cache first
			// online strategy
			return await this.handleOnline(cache, request);
		}
	}

	async handleOnline(cache, request) {
		// DevTools opening will trigger these o-i-c requests, which this SW can't handle.
		// https://bugs.chromium.org/p/chromium/issues/detail?id=823392
		if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
			return;
		}

		if (!cache) {
			// (at least) on safari, in some situations, cache is not defined on first requests
			// return to avoid runtime error in SW
			return new self.Response("cache is undefined");
		}

		let response = await cache.get(request);

		if (!response) {
			response = await self.fetch(request);
			cache.put(request, response);
		}
		return response;
	}

	async handleOffline(cache, request) {
		if (!cache) {
			// TODO: use better error page
			return new self.Response(
				"<h1>Please ensure that you're online</h1>"
			);
		} else {
			return await cache.get(request);
		}
	}

	/**
	 * Retrieves the cache
	 * @returns {CacheManager}
	 */
	getCache() {
		return this.cache;
	}
}
