import test from "ava";
import CacheStrategyBase from "../../../src/worker/strategies/CacheStrategy";
import Version from "../../../src/worker/Version";
import sinon from "sinon";

test.before(t => {
	t.context.oCacheStrategyBase = new CacheStrategyBase(
		"http://localhost:8080/res"
	);
	t.context.isOfflineStub = sinon.stub(CacheStrategyBase, "isOffline");
	t.context.fetchVersionStub = sinon.stub(
		t.context.oCacheStrategyBase,
		"fetchVersion"
	);

	class RequestStub {
		constructor(url) {
			this._url = url;
		}

		get url() {
			return this._url;
		}
	}

	class FakeResponse {
		constructor(body) {
			this.body = body;
		}
		async text() {
			return this.body;
		}
	}

	const noop = function() {};

	//selfStub = sinon.stub(global, "self");
	const globalSelf = {
		Request: RequestStub,
		Response: FakeResponse,
		fetch: noop,
		caches: {
			open: async function() {},
			keys: async function() {}
		}
	};
	t.context.cachesOpenStub = sinon.stub(globalSelf.caches, "open");
	t.context.keysStub = sinon.stub(globalSelf.caches, "keys");
	t.context.cacheStub = sinon.stub(t.context.oCacheStrategyBase, "getCache");
	global.self = globalSelf;
});

test.after(t => {
	t.context.cacheStub.restore();
	t.context.fetchVersionStub.restore();
	t.context.isOfflineStub.restore();
	t.context.keysStub.restore();
	t.context.cachesOpenStub.restore();
	delete global.self;
});
test.beforeEach(t => {
	t.context.fetchVersionStub.resolves(Version.fromString("1.55.3", "GG"));
	t.context.isOfflineStub.returns(false);
	t.context.cachesOpenStub.resolves({});
	t.context.keysStub.resolves([]);
});

test.serial("Should handle offline scenarios without cache", async function(
	assert
) {
	assert.context.isOfflineStub.returns(true);

	assert.context.cacheStub.returns(undefined);

	const result = await assert.context.oCacheStrategyBase.applyStrategy(
		new self.Request("http://localhost:3000/gime.html")
	);

	assert.truthy(result instanceof self.Response, "Returns response");
	assert.is(
		await result.text(),
		"<h1>Please ensure that you're online</h1>",
		"Show generic website"
	);
});

test.serial("Should handle offline scenarios with cache", async function(
	assert
) {
	assert.context.isOfflineStub.returns(true);

	const responseToReturn = new self.Response("my entity");
	assert.context.cacheStub.returns({
		get: function() {
			return responseToReturn;
		}
	});

	const result = await assert.context.oCacheStrategyBase.applyStrategy(
		new self.Request("http://localhost:3000/gime.html")
	);

	assert.deepEqual(
		responseToReturn,
		result,
		"Return predefined response from cache"
	);
});

test.serial("Should read data from cache (Cache First)", async function(
	assert
) {
	const responseToReturn = new self.Response("my entity");

	assert.context.cacheStub.returns({
		get: function() {
			return responseToReturn;
		}
	});
	const result = await assert.context.oCacheStrategyBase.applyStrategy(
		new self.Request("http://localhost:3000/gime.html")
	);

	assert.deepEqual(
		responseToReturn,
		result,
		"Return predefined response from cache"
	);
});

test.serial("Should write data into cache (Cache First)", async function(
	assert
) {
	const responseToReturn = new self.Response("my entity");

	assert.context.cacheStub.returns({
		get: function() {
			return undefined;
		},
		put: function(request) {
			assert.truthy(request);
		}
	});
	const fetchStub = sinon
		.stub(global.self, "fetch")
		.resolves(responseToReturn);

	const result = await assert.context.oCacheStrategyBase.applyStrategy(
		new self.Request("http://localhost:3000/gime.html")
	);

	assert.deepEqual(
		responseToReturn,
		result,
		"Request data and store in cache if no equivalent request/response exist in cache"
	);
	assert.is(fetchStub.callCount, 1);
	fetchStub.restore();
});
