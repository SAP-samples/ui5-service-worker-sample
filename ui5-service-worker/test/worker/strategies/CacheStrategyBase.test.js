import test from "ava";
import CacheStrategyBase from "../../../src/worker/strategies/CacheStrategy.js";
import Version from "../../../src/worker/Version.js";
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
	global.self = globalSelf;
});

test.after(t => {
	t.context.fetchVersionStub.restore();
	t.context.isOfflineStub.restore();
	t.context.keysStub.restore();
	t.context.cachesOpenStub.restore();
	delete global.self;
});
test.beforeEach(t => {
	t.context.fetchVersionStub.resolves(Version.fromString("1.55.3", "GG"));
	t.context.isOfflineStub.returns(false);
	t.context.cachesOpenStub.resolves({
		match: async function(request) {}
	});
	t.context.keysStub.resolves([]);
});

test("Should check if requested url matches", function(assert) {
	assert.truthy(
		assert.context.oCacheStrategyBase.matches(
			"http://localhost:8080/res/my.js"
		),
		"matches"
	);
	assert.falsy(
		assert.context.oCacheStrategyBase.matches(
			"http://infra:8080/res/resource.js"
		),
		"doesn't match"
	);
});

test("Should initialize a new cache", async function(assert) {
	await assert.context.oCacheStrategyBase.init();
	assert.truthy(assert.context.oCacheStrategyBase.getCache());
});

test.serial(
	"Should initialize a new cache if version has changed",
	async function(assert) {
		assert.falsy(
			assert.context.oCacheStrategyBase.version,
			"Cleans up cache property"
		);

		// init
		await assert.context.oCacheStrategyBase.init();
		assert.truthy(
			assert.context.oCacheStrategyBase.version,
			"Cleans up cache property"
		);
		const initialCache = await assert.context.oCacheStrategyBase.getCache();
		assert.truthy(initialCache, "create initial cache");
		await assert.context.oCacheStrategyBase.init();
		const cache = await assert.context.oCacheStrategyBase.getCache();
		assert.deepEqual(cache, initialCache, "initial cache stays the same");

		// newer version
		assert.context.fetchVersionStub.resolves(
			Version.fromString("1.55.4", "GG")
		);

		const reinitializeSpy = sinon.spy(
			assert.context.oCacheStrategyBase,
			"reinitialize"
		);

		await assert.context.oCacheStrategyBase.init();
		const reinitializedCache = await assert.context.oCacheStrategyBase.getCache();
		assert.is(reinitializeSpy.callCount, 1);
		assert.not(
			cache,
			reinitializedCache,
			"reinitializeCache should be different than cache"
		);
	}
);

test("Should throw if #isInitialRequest is called (Sad Path)", function(assert) {
	assert.throws(
		() => {
			new CacheStrategyBase().isInitialRequest();
		},
		{message: "must be implemented by strategy"},
		"Error is thrown"
	);
});

test("Should throw if sub class doesn't implement the required interface (Sad Path)", async function(assert) {
	await assert.throwsAsync(
		async () => {
			await new CacheStrategyBase().fetchVersion();
		},
		{message: "must be implemented by strategy"},
		"Don't implement the required cache strategy"
	);
});
