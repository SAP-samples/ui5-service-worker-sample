/**
 * Represents the manifest config
 */
export default class ManifestConfig {
	static async fetchManifest(manifestFile = "manifest.json") {
		const response = await self.fetch(manifestFile);
		return await response.json();
	}

	/**
	 *
	 * @param manifestFile
	 * @returns {Promise<Array>}
	 */
	static async loadFromManifest(manifestFile = "manifest.json") {
		const result = await ManifestConfig.fetchManifest(manifestFile);
		if (result["sap.app"] && result["sap.app"]["serviceWorker"]) {
			return result["sap.app"]["serviceWorker"]["config"];
		}
		return [];
	}
}
