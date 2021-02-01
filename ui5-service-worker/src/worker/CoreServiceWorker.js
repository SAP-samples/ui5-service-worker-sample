import ApplicationCacheStrategy from "./strategies/ApplicationCacheStrategy";
import UI5ResourceCacheStrategy from "./strategies/UI5ResourceCacheStrategy";
import CacheAllStrategy from "./strategies/CacheAllStrategy";
import CacheWithExpirationStrategy from "./strategies/CacheWithExpirationStrategy";
import CacheNetworkUpdateStrategy from "./strategies/CacheNetworkUpdateStrategy";
import PreCacheStrategy from "./strategies/PreCacheStrategy";
import ManifestConfig from "./config/ManifestConfig";
import CacheStrategyBaseImport from "./strategies/CacheStrategy";
import StrategyManager from "./StrategyManager";
import MessageManager from "./message/MessageManager";
import Logger from "./Logger";

const oStrategyManager = StrategyManager.create();
const oMessageManager = MessageManager.create();

// transfer object
export const status = {};

self.addEventListener('install', event => {
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	self.clients.claim();
});

self.addEventListener("fetch", event => {
	Logger.getLogger().log("FETCH " + event.request.url);
	event.respondWith(
		(async function() {
			try {
				const request = event.request;
				// Read always from cache if in offline mode
				return await oStrategyManager.applyStrategy(request);
			} catch (e) {
				Logger.getLogger().error("Error in fetch: ", e);
				throw e;
			}
		})()
	);
});

// listen to messages from clients
self.addEventListener('message', (event) => {
	oMessageManager.handleClientMessage(event, status);
});

/**
 * sets a handler which handles client messages
 * @code
 * self.worker.onClientMessage(function(event){
 *
 * });
 */
export const onClientMessage = oMessageManager.setClientMessageHandler.bind(oMessageManager);
export const sendToClient = oMessageManager.sendMessageToAllClients.bind(oMessageManager);
export const addStrategy = oStrategyManager.addStrategy.bind(oStrategyManager);
export const CacheStrategyBase = CacheStrategyBaseImport;
export const strategies = {
	CacheAllStrategy,
	UI5ResourceCacheStrategy,
	ApplicationCacheStrategy,
	PreCacheStrategy,
	CacheWithExpirationStrategy,
	CacheNetworkUpdateStrategy
};

/**
 * Service Worker Version
 * @type {string}
 */
export const version = "0.0.1";



export const initFromManifest = async (config = {}) => {
	const aConfigs = await ManifestConfig.loadFromManifest(config.manifestUrl);
	await init(aConfigs);
};

/**
 *
 * @param aConfigs
 */
export const init = async aConfigs => {

	const apConfigs = aConfigs.map(oOrigConfig => {
		const oConfig = Object.assign({}, oOrigConfig);

		const type = oConfig.type;
		if (!type) {
			throw new Error(
				`type not specified. Must be a function, an instance of CacheStrategyBase or one of ["application", "ui5resource", "static", "precache", "networkupdate"]`
			);
		}
		delete oConfig.type;
		let strategyInstance;
		if (typeof type === "object") {
			strategyInstance = type;
		} else if (typeof type === "function" && type.constructor) {
			strategyInstance = new type(oConfig);
		} else if (typeof type === "string") {
			// lookup type from string
			switch (type.toLowerCase()) {
				case "application": {
					strategyInstance = new ApplicationCacheStrategy(oConfig);
					break;
				}
				case "ui5resource": {
					strategyInstance = new UI5ResourceCacheStrategy(oConfig);
					break;
				}
				case "static": {
					strategyInstance = new CacheAllStrategy(oConfig);
					break;
				}
				case "precache": {
					strategyInstance = new PreCacheStrategy(oConfig);
					break;
				}
				case "networkupdate": {
					strategyInstance = new CacheNetworkUpdateStrategy(oConfig);
					break;
				}
				case "expiration": {
					strategyInstance = new CacheWithExpirationStrategy(oConfig);
					break;
				}
				default:
					throw new Error(
						`Cannot find strategy: ${type}. Allowed values are: ["application", "ui5resource", "static", "precache", "networkupdate"]`
					);
			}
		}

		if (strategyInstance instanceof CacheStrategyBase) {
			if (oConfig.priority) {
				strategyInstance.priority = oConfig.priority;
			}
			oStrategyManager.addStrategy(strategyInstance);
			return strategyInstance.init();
		} else {
			throw new Error(`Strategy must be of type CacheStrategyBase`);
		}
	});
	await Promise.all(apConfigs);

	const aMessages = aConfigs.map(oOrigConfig => {
		if (typeof oOrigConfig.type === "string") {
			return oOrigConfig.type;
		}
	});
	status.init = aMessages;
};

export const enableLogging = () => {
	Logger.enable();
};
