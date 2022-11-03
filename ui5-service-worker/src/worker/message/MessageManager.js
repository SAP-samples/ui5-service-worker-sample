import Logger from "../Logger.js";

/**
 * Represents the class for message handling
 */
export default class MessageManager {

	constructor() {
		this.clientMessageHandler = undefined;
	}

	setClientMessageHandler(clientMessageHandler){
		Logger.getLogger().log("client message handler set");
		this.clientMessageHandler = clientMessageHandler;
	}

	async sentMessageToClient2(client, msg){
		return new Promise(function(resolve, reject){
			var messageChannel = new MessageChannel();

			messageChannel.port1.onmessage = function(event){
				if(event.data.error){
					reject(event.data.error);
				}else{
					resolve(event.data);
				}
			};

			client.postMessage("SW Says: '"+msg+"'", [messageChannel.port2]);
		});
	}

	async sendMessageToClient(client, msg) {
		return client.postMessage({msg});
	}


	// TODO switch to BroadcastChannel api once its available and supported
	// @see https://developers.google.com/web/updates/2016/09/broadcastchannel
	async sendMessageToAllClients(msg){
		const aClients = await clients.matchAll();
		const pClientMessages = aClients.map(client => {
			return this.sendMessageToClient(client, msg);
			//return this.sentMessageToClient(client, msg);
		});
		return await Promise.all(pClientMessages);
	}

	handleClientMessage(event, status) {
		if (this.clientMessageHandler) {
			this.clientMessageHandler(event, status);
		} else {
			Logger.getLogger().log("Unhandled Client message received: " + event.data);
		}
	}

	static create() {
		return new MessageManager();
	}

}