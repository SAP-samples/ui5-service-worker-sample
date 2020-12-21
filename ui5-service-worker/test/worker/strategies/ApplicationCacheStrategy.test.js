import test from "ava";
import sinon from "sinon";

import ApplicationCacheStrategy from "../../../src/worker/strategies/ApplicationCacheStrategy";

var fetchStub;
var oApplicationCacheStrategy;
var appJsonContent = {
	"sap.app": {
		applicationVersion: {
			version: "1.43.2"
		}
	}
};

test.beforeEach(function() {
	oApplicationCacheStrategy = new ApplicationCacheStrategy(
		"http://localhost:8080/res"
	);
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

test("Should check if requested resource is the initial request", function(assert) {
	assert.falsy(
		oApplicationCacheStrategy.isInitialRequest(
			"http://localhost:8080/res/a.js",
			"resource request is not initial"
		)
	);
	assert.truthy(
		oApplicationCacheStrategy.isInitialRequest(
			"http://localhost:8080/res/index.html",
			"index.html request is initial"
		)
	);
});

test("Should retrieve application version defined in manifest.json", function(assert) {
	assert.deepEqual(
		oApplicationCacheStrategy.getVersionFromJson(appJsonContent).asString(),
		"app-1.43.2",
		"version"
	);
});

test("Should retrieve application version", async function(assert) {
	await oApplicationCacheStrategy
		.fetchVersion("http://localhost:8080/res")
		.then(function(version) {
			assert.deepEqual(version.asString(), "app-1.43.2", "version");
		});
});
