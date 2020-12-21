import test from "ava";
import sinon from "sinon";

import ManifestConfig from "../../../src/worker/config/ManifestConfig";

var fetchStub;
var appJsonContent = {
	"sap.app": {
		applicationVersion: {
			version: "1.43.2"
		}
	}
};

test.beforeEach(function() {
	const globalSelf = {
		fetch: function() {}
	};
	fetchStub = sinon.stub(globalSelf, "fetch").resolves({
		json: function() {
			return appJsonContent;
		}
	});
	global.self = globalSelf;
});
test.afterEach.always(() => {
	fetchStub.restore();
});

test("Should load manifest.json", async function(assert) {
	const oManifest = await ManifestConfig.fetchManifest(
		"http://localhost:8080/res"
	);
	assert.deepEqual(oManifest, appJsonContent, "json");
});
