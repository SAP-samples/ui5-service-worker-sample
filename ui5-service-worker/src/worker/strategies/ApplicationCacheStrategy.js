import Version from "../Version";
import CacheStrategy from "./CacheStrategy";
import ManifestConfig from "../config/ManifestConfig";

export default class ApplicationCacheStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		this.rootUrl = config.manifestRootUrl || config.url;
		this.initialRequestEndings = config.initialRequestEndings || ["/index.html"];
	}

	isInitialRequest(url) {
		return this.initialRequestEndings.some((initialRequestEnding) => {
			return url.endsWith(initialRequestEnding);
		});
	}

	getVersionFromJson(json = {}) {
		const app = json["sap.app"];

		if (app && app.applicationVersion && app.applicationVersion.version) {
			return Version.fromString(app.applicationVersion.version, "app");
		}

		throw Error("Cannot get version from manifest");
	}

	async fetchVersion() {
		const version = await ManifestConfig.fetchManifest(
			`${this.rootUrl}/manifest.json`
		);
		return this.getVersionFromJson(version);
	}
}
