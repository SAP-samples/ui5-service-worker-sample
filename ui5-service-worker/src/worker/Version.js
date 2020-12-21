/**
 *
 */
class BaseVersion {
	constructor(major, minor, fix) {
		this.major = major;
		this.minor = minor;
		this.fix = fix;
		this._major;
		this._minor;
		this._fix;
	}

	static validate(number) {
		if (typeof number !== "number") {
			throw Error("Not a valid number given");
		}
	}

	asString() {
		return `${this.major}.${this.minor}.${this.fix}`;
	}

	get major() {
		return this._major;
	}

	get minor() {
		return this._minor;
	}

	get fix() {
		return this._fix;
	}

	set major(majorVersion) {
		BaseVersion.validate(majorVersion);
		this._major = majorVersion;
	}

	set minor(minorVersion) {
		BaseVersion.validate(minorVersion);
		this._minor = minorVersion;
	}

	set fix(fixVersion) {
		BaseVersion.validate(fixVersion);
		this._fix = fixVersion;
	}

	compare(version) {
		if (this.major > version.major) return 1;
		if (this.major < version.major) return -1;

		if (this.minor > version.minor) return 1;
		if (this.minor < version.minor) return -1;

		if (this.fix > version.fix) return 1;
		if (this.fix < version.fix) return -1;

		return 0;
	}

	static extractGroups(version) {
		const match = version.match(
			/(\d+)\.(\d+)\.(\d+)/
		);
		const major = match[1];
		const minor = match[2];
		const fix = match[3];
		return {
			major: Number(major),
			minor: Number(minor),
			fix: Number(fix)
		};
	}
}

export default class Version extends BaseVersion {
	constructor(major, minor, fix, prefix, delimiter) {
		super(major, minor, fix);
		this.prefix = prefix;
		this.delimiter = delimiter || "-";
		this._prefix;
		this._delimiter;
	}

	/**
	 *
	 * @param versionWithPrefix
	 * @param delimiter
	 * @return {Version}
	 */
	static fromStringWithDelimiter(versionWithPrefix, delimiter = "-") {
		const split = versionWithPrefix.split(delimiter);
		if (split.length < 2) {
			throw Error("string does not include a delimiter");
		}
		const version = split[1];
		const prefix = split[0];
		return Version.fromString(version, prefix, delimiter);
	}

	static fromString(version, prefix, delimiter) {
		var {major, minor, fix} = super.extractGroups(version);
		return new Version(major, minor, fix, prefix, delimiter);
	}

	set delimiter(delimiter) {
		if (typeof delimiter !== "string") {
			throw Error("Delimiter must be of type string");
		}
		this._delimiter = delimiter;
	}

	get delimiter() {
		return this._delimiter;
	}

	set prefix(prefix) {
		if (typeof prefix !== "string") {
			throw Error("Prefix must be of type string");
		}
		this._prefix = prefix;
	}

	get prefix() {
		return this._prefix;
	}

	compare(version) {
		if (this.prefix !== version.prefix) {
			throw new Error("Comparing different types of prefixes");
		}
		if (this.delimiter !== version.delimiter) {
			throw new Error("Comparing different types of delimiters");
		}
		return super.compare(version);
	}

	asString() {
		return `${this.prefix}${this.delimiter}${super.asString()}`;
	}
}
