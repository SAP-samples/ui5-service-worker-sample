import test from "ava";
import UI5ResourceCacheStrategy from "../../../src/worker/strategies/UI5ResourceCacheStrategy.js";
import sinon from "sinon";
var fetchStub;
var selfStub;
var oUI5ResourceCacheStrategy;
var versionJsonContent = {
	version: "1.43.2"
};
test.beforeEach(function() {
	oUI5ResourceCacheStrategy = new UI5ResourceCacheStrategy(
		"http://localhost:8080/res"
	);
	const globalSelf = {
		fetch: function() {}
	};
	fetchStub = sinon.stub(globalSelf, "fetch").resolves({
		json: function() {
			return versionJsonContent;
		}
	});
	global.self = globalSelf;
});
test.afterEach.always(() => {
	fetchStub.restore();
});

test("Should check if requested resource is the initial request", function(assert) {
	assert.falsy(
		oUI5ResourceCacheStrategy.isInitialRequest(
			"http://localhost:8080/res/a.js",
			"resource request is not initial"
		)
	);
	assert.truthy(
		oUI5ResourceCacheStrategy.isInitialRequest(
			"http://localhost:8080/res/sap-ui-core.js",
			"sap-ui-core.js request is initial"
		)
	);
});

test("Should load sap-ui-version.json", async function(assert) {
	await oUI5ResourceCacheStrategy
		.waitForVersionJSON("http://localhost:8080/res")
		.then(function(responseJson) {
			assert.deepEqual(responseJson, versionJsonContent, "json");
		});
});

test("Should retrieve application version defined in sap-ui-version.json", function(assert) {
	assert.deepEqual(
		oUI5ResourceCacheStrategy
			.getVersionFromJson(versionJsonContent)
			.asString(),
		"resources-1.43.2",
		"version"
	);
});

test("Should retrieve application version", async function(assert) {
	await oUI5ResourceCacheStrategy
		.fetchVersion("http://localhost:8080/res")
		.then(function(version) {
			assert.deepEqual(version.asString(), "resources-1.43.2", "version");
		});
});
