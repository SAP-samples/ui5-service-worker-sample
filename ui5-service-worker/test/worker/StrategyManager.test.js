import test from "ava";
import StrategyManager from "../../src/worker/StrategyManager.js";
import sinon from "sinon";

var oStrategyManager;
var oResponseStub;
test.beforeEach(assert => {
	oStrategyManager = new StrategyManager();
	assert.truthy(
		oStrategyManager,
		"StrategyManager successfully instantiated"
	);

	class RequestStub {
		constructor(url) {
			this._url = url;
		}

		get url() {
			return this._url;
		}
	}

	const globalSelf = {
		Response: function() {},
		Request: RequestStub
	};
	const oResponse = function() {};
	oResponseStub = sinon.stub(globalSelf, "Response").returns(oResponse);

	global.self = globalSelf;
});

test.afterEach(assert => {
	oResponseStub.restore();
	delete global.self;
});

// mock strategy
class MockStrategy {
	constructor(url) {
		this.url = url;
	}
	matches(urlParam) {
		return urlParam.startsWith(this.url);
	}
	isInitialRequest() {
		return true;
	}
	async applyStrategy(request) {
		return new self.Response("mytext");
	}
	async init() {
		this._version = true;
	}
}
var createStrategy = function(rootUrl) {
	return new MockStrategy(rootUrl);
};

test("Should ensure that strategies are added and can be retrieved", function(assert) {
	var strategy = createStrategy("http://localhost:8080/myurl");
	var otherStrategy = createStrategy("http://localhost:8080/otherUrl");
	oStrategyManager.addStrategy(strategy);
	oStrategyManager.addStrategy(otherStrategy);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/myurl"),
		strategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/otherUrl"),
		otherStrategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/unknownUrl"),
		undefined
	);
});

test("Multiple strategies matching same pattern", function(assert) {
	var strategy = createStrategy("http://localhost:8080/");
	var otherStrategy = createStrategy("http://localhost:8080/otherUrl");
	var otherSubStrategy = createStrategy("http://localhost:8080/otherUrl/wow");
	otherStrategy.priority = 1;
	otherSubStrategy.priority = 2;
	oStrategyManager.addStrategy(strategy);
	oStrategyManager.addStrategy(otherStrategy);
	oStrategyManager.addStrategy(otherSubStrategy);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/myurl"),
		strategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/otherUrl"),
		otherStrategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/otherUrl/wow"),
		otherSubStrategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/otherUrl/wow/omg"),
		otherSubStrategy
	);
	assert.deepEqual(
		oStrategyManager.getStrategy("http://localhost:8080/unknownUrl"),
		strategy
	);
});

test("Should ensure that strategy is initialized", async assert => {
	var strategy = createStrategy("http://localhost:8080/myurl");
	var initSpy = sinon.spy(strategy, "init");

	await StrategyManager.ensureStrategyIsInitialized(strategy)
		.then(function() {
			assert.is(1, initSpy.callCount);

			return StrategyManager.ensureStrategyIsInitialized(strategy);
		})
		.then(function() {
			assert.is(initSpy.callCount, 1);
			initSpy.restore();
		});
});

test("Should apply strategy for request", async assert => {
	var strategy = createStrategy("http://localhost:8080/myurl");
	var initSpy = sinon.spy(strategy, "init");
	var applyStrategySpy = sinon.spy(strategy, "applyStrategy");
	oStrategyManager.addStrategy(strategy);

	await oStrategyManager.applyStrategy(
		new self.Request("http://localhost:8080/myurl")
	);
	assert.is(initSpy.callCount, 1);
	assert.is(applyStrategySpy.callCount, 1);

	initSpy.restore();
	applyStrategySpy.restore();
});
