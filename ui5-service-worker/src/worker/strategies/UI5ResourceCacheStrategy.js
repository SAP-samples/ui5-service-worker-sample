import Version from "../Version";
import CacheStrategy from "./CacheStrategy";

export default class UI5ResourceCacheStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		this.rootUrl = config.url;
	}

	isInitialRequest(url) {
		return url.endsWith("/sap-ui-core.js");
	}

	async waitForVersionJSON(url) {
		const response = await self.fetch(`${url}/sap-ui-version.json`);
		return await response.json();
	}

	getVersionFromJson(json = {}) {
		return Version.fromString(json.version, "resources");
	}

	async fetchVersion() {
		const version = await this.waitForVersionJSON(this.rootUrl);
		return this.getVersionFromJson(version);
	}
}
