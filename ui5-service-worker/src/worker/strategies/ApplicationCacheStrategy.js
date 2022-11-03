import Version from "../Version.js";
import CacheStrategy from "./CacheStrategy.js";
import ManifestConfig from "../config/ManifestConfig.js";

export default class ApplicationCacheStrategy extends CacheStrategy {
	constructor(config) {
		super(config.url);
		// no exclusion if undefined => backward compatibility
		this.excludeRegExp = typeof config.exclude === "string" && new RegExp(config.exclude);
		this.rootUrl = config.manifestRootUrl || config.url;
		this.initialRequestEndings = config.initialRequestEndings || ["/index.html"];
	}

	/**
	 * application cache specfic logic
	 * - if exclusin regexp is provided and matches the URL, the URL is declined
	 * - proceed with super implementation otherwise
	 *
	 * @param url
	 * @returns {boolean} whether or not url matches
	 */
	matches(url) {
		return !(this.excludeRegExp && this.excludeRegExp.test(url)) && super.matches(url);
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
