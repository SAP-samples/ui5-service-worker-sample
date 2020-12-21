import test from "ava";
import Version from "../../src/worker/Version";
import CacheManager from "../../src/worker/CacheManager";

var oCacheManager;
test.beforeEach(async function() {
	const noop = function() {};

	class Cache {
		constructor() {
			this.entries = new Map();
		}

		async delete(req) {
			this.entries.delete(req);
			return Promise.resolve(true);
		}

		async put(req, resp) {
			this.entries.set(req, resp);
		}

		async match(req) {
			return this.entries.get(req);
		}
	}

	const cacheEntries = {};
	const keys = [];
	const caches = {
		open: async function(key) {
			keys.push(key);
			if (!cacheEntries[key]) {
				cacheEntries[key] = new Cache();
			}
			return cacheEntries[key];
		},
		keys: async function() {
			return keys;
		},
		delete: async function(key) {
			if (keys.indexOf(key) > -1) {
				keys.splice(keys.indexOf(key), 1);
			}
			return Promise.resolve(true);
		}
	};

	class FakeRequest {}

	class FakeResponse {
		constructor(body) {
			this.body = body;
		}

		async text() {
			return this.body;
		}

		clone() {
			return this;
		}
	}

	//selfStub = sinon.stub(global, "self");
	const globalSelf = {
		Response: FakeResponse,
		Request: FakeRequest,
		fetch: noop,
		caches: caches
	};
	global.self = globalSelf;
	oCacheManager = await CacheManager.create({
		version: "TEST_WORKER_CacheManager"
	});
});
test.afterEach.always(async function() {
	await oCacheManager.truncate();
	delete global.self;
});

test("Should create Cache with a specific revision", async function(assert) {
	var version = "TEST_WORKER_CacheManager_create";
	await CacheManager.create({version});
	const keys = await self.caches.keys();
	assert.truthy(keys.includes(version));
});

test("Should cleanup cache with versions which doesn't match", async function(assert) {
	await CacheManager.create({version: "MINE-1.55.7"});
	await CacheManager.create({version: "MINE-1.56.9"});
	const keys = await self.caches.keys();
	assert.truthy(keys.includes("MINE-1.55.7"));
	assert.truthy(keys.includes("MINE-1.56.9"));
	const currentVersion = Version.fromStringWithDelimiter("MINE-1.55.8", "-");
	const pCleanup = await CacheManager.cleanup(currentVersion);
	const newKeys = await self.caches.keys();
	assert.falsy(newKeys.includes("MINE-1.55.7"));
	assert.falsy(newKeys.includes("MINE-1.56.9"));
});

test("Should open cache with a specific revision", async function(assert) {
	var version = "TEST_WORKER-1.64.0";
	await oCacheManager.open({version});
	const keys = await self.caches.keys();
	assert.truthy(keys.includes(version));
});

test("Should truncate caches", async function(assert) {
	const version = "TEST_WORKER_CacheManager_truncate";
	await oCacheManager.open({version});
	const keys = await self.caches.keys();
	const prevLength = keys.length;
	assert.truthy(keys.length > 0);
	await oCacheManager.truncate([version]);
	const newKeys = await self.caches.keys();
	assert.is(prevLength - 1, newKeys.length);
});

test("Should put request into cache and retrieve it", async function(assert) {
	var request = new self.Request("http://localhost");
	var response = new self.Response("test");
	await oCacheManager.put(request, response);
	const resp = await oCacheManager.get(request);
	assert.deepEqual(resp, response);
});

test("Should delete request from cache", async function(assert) {
	var request = new self.Request("http://localhost");
	var response = new self.Response("test");
	await oCacheManager.put(request, response);
	await oCacheManager.delete(request);
	const resp = await oCacheManager.get(request);
	assert.deepEqual(resp, undefined);
});
