
const loggerMap = new Map();
let enabled = false;

export default class Logger {

	debug() {
		if (enabled) {
			console.debug.apply(this, arguments);
		}
	}
	log() {
		if (enabled) {
			console.log.apply(this, arguments);
		}
	}
	error() {
		if (enabled) {
			console.error.apply(this, arguments);
		}
	}

	static enable() {
		enabled = true;
	}

	static setlogger(name, logger) {
		loggerMap.set(name, logger);
	}

	static getLogger(name="default") {
		const loggerFromCache = loggerMap.get(name);
		if (loggerFromCache) {
			return loggerFromCache;
		}
		const newLogger= new Logger();
		Logger.setlogger(name, newLogger);
		return newLogger;
	}

}