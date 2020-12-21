
const loggerMap = new Map();
let enabled = false;

export default class Logger {

	log(message) {
		if (enabled) {
			console.log(message);
		}
	}
	error(message) {
		if (enabled) {
			console.error(message);
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