import test from "ava";
import Version from "../../src/worker/Version.js";

test("Should parse version from string with delimiter", assert => {
	var version = Version.fromStringWithDelimiter("GG_1.55.3", "_");
	assert.is(
		version.asString(),
		"GG_1.55.3",
		"asString returns the version string"
	);
});

test("Should parse version from string", assert => {
	var version = Version.fromString("1.55.3", "GG");
	assert.is(
		version.asString(),
		"GG-1.55.3",
		"asString returns the version string"
	);
	assert.is(version.prefix, "GG", "prefix is 'GG'");
	assert.is(version.major, 1, "major is 1");
	assert.is(version.minor, 55, "minor is 55");
	assert.is(version.fix, 3, "fix is 3");
});

test("Should compare versions", assert => {
	var baseVersion = Version.fromString("1.55.3", "GG");
	var versionMajorChange = Version.fromString("2.55.3", "GG");

	var versionMinorChange = Version.fromString("1.56.3", "GG");

	var versionFixChange = Version.fromString("1.55.4", "GG");
	var versionPrefixChange = Version.fromString("1.55.4", "GGG");
	var versionDelimiterChange = Version.fromString("1.55.4", "GG", "_");

	assert.is(baseVersion.compare(baseVersion), 0, "same version is equal");

	// major
	assert.is(
		baseVersion.compare(versionMajorChange),
		-1,
		"major change is bigger"
	);
	assert.is(
		versionMajorChange.compare(baseVersion),
		1,
		"major change is smaller"
	);

	// minor
	assert.is(
		baseVersion.compare(versionMinorChange),
		-1,
		"minor change is bigger"
	);
	assert.is(
		versionMinorChange.compare(baseVersion),
		1,
		"minor change is bigger"
	);

	// fix
	assert.is(
		baseVersion.compare(versionFixChange),
		-1,
		"fix change is bigger"
	);
	assert.is(versionFixChange.compare(baseVersion), 1, "fix change is bigger");

	// different prefix
	assert.throws(
		function() {
			baseVersion.compare(versionPrefixChange);
		},
		{message: "Comparing different types of prefixes"},
		"compare different prefixes"
	);

	// different delimiters
	assert.throws(
		function() {
			baseVersion.compare(versionDelimiterChange);
		},
		{message: "Comparing different types of delimiters"},
		"compare different delimiters"
	);
});
