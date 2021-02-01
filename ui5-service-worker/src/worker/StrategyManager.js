import Logger from "./Logger";

export default class StrategyManager {
	constructor() {
		this.strategies = [];
	}

	/**
	 * adds a strategy
	 * @param strategy
	 */
	addStrategy(strategy) {
		strategy.priority = strategy.priority || 0;
		this.strategies.push(strategy);
		if (strategy.priority) {
			this.strategies.sort((a, b) => {
				if (a.priority === b.priority) {
					return 0;
				}
				return b.priority > a.priority ? 1 : -1;
			});
		}
	}

	static async ensureStrategyIsInitialized(strategy) {
		if (!strategy._version) {
			Logger.getLogger().log("Strategy init called");
			await strategy.init();
		}
	}

	getStrategy(url) {
		return this.strategies.find(strategy => {
			if (strategy.matches(url)) {
				return strategy;
			}
		});
	}

	async applyStrategy(request) {
		const strategy = this.getStrategy(request.url);
		if (strategy) {
			if (strategy.isInitialRequest(request.url)) {
				await strategy.init();
			}
			await StrategyManager.ensureStrategyIsInitialized(strategy);
			return strategy.applyStrategy(request);
		}
		return self.fetch(request);
	}

	static create() {
		return new StrategyManager();
	}
}
