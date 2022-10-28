(()=>{"use strict";var e={d:(t,i)=>{for(var s in i)e.o(i,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:i[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{CacheStrategyBase:()=>E,addStrategy:()=>b,enableLogging:()=>R,init:()=>j,initFromManifest:()=>M,onClientMessage:()=>x,sendToClient:()=>_,status:()=>v,strategies:()=>C,version:()=>I});class i{constructor(e,t,i){this.major=e,this.minor=t,this.fix=i,this._major,this._minor,this._fix}static validate(e){if("number"!=typeof e)throw Error("Not a valid number given")}asString(){return`${this.major}.${this.minor}.${this.fix}`}get major(){return this._major}get minor(){return this._minor}get fix(){return this._fix}set major(e){i.validate(e),this._major=e}set minor(e){i.validate(e),this._minor=e}set fix(e){i.validate(e),this._fix=e}compare(e){return this.major>e.major?1:this.major<e.major?-1:this.minor>e.minor?1:this.minor<e.minor?-1:this.fix>e.fix?1:this.fix<e.fix?-1:0}static extractGroups(e){const t=e.match(/(\d+)\.(\d+)\.(\d+)/),i=t[1],s=t[2],r=t[3];return{major:Number(i),minor:Number(s),fix:Number(r)}}}class s extends i{constructor(e,t,i,s,r){super(e,t,i),this.prefix=s,this.delimiter=r||"-",this._prefix,this._delimiter}static fromStringWithDelimiter(e,t="-"){const i=e.split(t);if(i.length<2)throw Error("string does not include a delimiter");const r=i[1],n=i[0];return s.fromString(r,n,t)}static fromString(e,t,i){var{major:r,minor:n,fix:a}=super.extractGroups(e);return new s(r,n,a,t,i)}set delimiter(e){if("string"!=typeof e)throw Error("Delimiter must be of type string");this._delimiter=e}get delimiter(){return this._delimiter}set prefix(e){if("string"!=typeof e)throw Error("Prefix must be of type string");this._prefix=e}get prefix(){return this._prefix}compare(e){if(this.prefix!==e.prefix)throw new Error("Comparing different types of prefixes");if(this.delimiter!==e.delimiter)throw new Error("Comparing different types of delimiters");return super.compare(e)}asString(){return`${this.prefix}${this.delimiter}${super.asString()}`}}const r=new Map;let n=!1;class a{debug(){n&&console.debug.apply(this,arguments)}log(){n&&console.log.apply(this,arguments)}error(){n&&console.error.apply(this,arguments)}static enable(){n=!0}static setlogger(e,t){r.set(e,t)}static getLogger(e="default"){const t=r.get(e);if(t)return t;const i=new a;return a.setlogger(e,i),i}}class o{static async create({version:e}){return await(new o).open({version:e})}static async cleanup(e){a.getLogger().log("Clear outdated for current version: "+e.asString());const t=(await self.caches.keys()).filter((function(t){a.getLogger().log("Cache: "+t);try{return 0!==s.fromStringWithDelimiter(t,e.delimiter).compare(e)}catch(e){return!1}})).map((function(e){return a.getLogger().log("Delete: "+e),self.caches.delete(e)}));return await Promise.all(t)}async open({version:e}){return this.cache=await self.caches.open(e),this}async get(e){return await this.cache.match(e)}async truncate(e){const t=e||await self.caches.keys();return await Promise.all(t.map(self.caches.delete.bind(self.caches))),this}async put(e,t){if("HEAD"===e.method||"POST"===e.method)return this;const i=t.clone();return await this.cache.put(e,i).catch((t=>{console.log(`Failed to add request to cache (cause is logged on debug level): ${e.method} to ${e.url}`,"You may want to consider adjusting stragtegy configuration to exclude this URLs in the first place"),console.debug("Failed to add request to cache, error, request, response: ",t,e,i)})),this}async delete(e){return await this.cache.delete(e),this}}class c{constructor(e){this._version=void 0,this._matcher=e}get version(){return this._version}static isOffline(){return!navigator.onLine}matches(e){return Array.isArray(this._matcher)?this._matcher.includes(e):this._matcher instanceof RegExp?this._matcher.test(e):"function"==typeof this._matcher?this._matcher(e):"string"==typeof this._matcher&&e.startsWith(this._matcher)}async fetchVersion(){throw new Error("must be implemented by strategy")}isInitialRequest(e){throw new Error("must be implemented by strategy")}async init(){this.cache?c.isOffline()||await this.reinitialize():(this._version=await this.fetchVersion(),this.cache=await o.create({version:this.version.asString()}))}async reinitialize(){const e=this.version&&this.version.asString();this._version=await this.fetchVersion(),e!==this.version.asString()&&(this.cache=await o.create({version:this.version.asString()})),await o.cleanup(this.version)}async applyStrategy(e){if(!(e&&e instanceof self.Request))throw new Error("request is required");const t=this.getCache();return c.isOffline()?await this.handleOffline(t,e):await this.handleOnline(t,e)}async handleOnline(e,t){if("only-if-cached"===t.cache&&"same-origin"!==t.mode)return;if(!e)return new self.Response("cache is undefined");let i=await e.get(t);return i||(i=await self.fetch(t),e.put(t,i)),i}async handleOffline(e,t){return e?await e.get(t):new self.Response("<h1>Please ensure that you're online</h1>")}getCache(){return this.cache}}class l{static async fetchManifest(e="manifest.json"){const t=await self.fetch(e);return await t.json()}static async loadFromManifest(e="manifest.json"){const t=await l.fetchManifest(e);return t["sap.app"]&&t["sap.app"].serviceWorker?t["sap.app"].serviceWorker.config:[]}}class h extends c{constructor(e){super(e.url),this.excludeRegExp="string"==typeof e.exclude&&new RegExp(e.exclude),this.rootUrl=e.manifestRootUrl||e.url,this.initialRequestEndings=e.initialRequestEndings||["/index.html"]}matches(e){return!(this.excludeRegExp&&this.excludeRegExp.test(e))&&super.matches(e)}isInitialRequest(e){return this.initialRequestEndings.some((t=>e.endsWith(t)))}getVersionFromJson(e={}){const t=e["sap.app"];if(t&&t.applicationVersion&&t.applicationVersion.version)return s.fromString(t.applicationVersion.version,"app");throw Error("Cannot get version from manifest")}async fetchVersion(){const e=await l.fetchManifest(`${this.rootUrl}/manifest.json`);return this.getVersionFromJson(e)}}class u extends c{constructor(e){super(e.url),this.rootUrl=e.url}isInitialRequest(e){return e.endsWith("/sap-ui-core.js")}async waitForVersionJSON(e){const t=await self.fetch(`${e}/sap-ui-version.json`);return await t.json()}getVersionFromJson(e={}){return s.fromString(e.version,"resources")}async fetchVersion(){const e=await this.waitForVersionJSON(this.rootUrl);return this.getVersionFromJson(e)}}class g extends c{constructor(e){super(e.url),this._isInitial=!0,this.name=e.name||"STATIC"}async fetchVersion(){return s.fromString("0.0.0",this.name)}isInitialRequest(e){return this._isInitial&&(this._isInitial=!1),this._isInitial}}class f extends c{constructor(e){super(e.url),this._isInitial=!0,this._timeInMs=e.timeInMs}async fetchVersion(){return s.fromString("0.0.0","TIMED")}isExpired(){return(new Date).getTime()-this.lastAccessTime<this._timeInMs}async handleOnline(e,t){if(!e)return new self.Response("cache is undefined");let i=await e.get(t);return i&&!this.isExpired()||(i=await self.fetch(t),e.put(t,i)),this.lastAccessTime=(new Date).getTime(),i}isInitialRequest(e){return this._isInitial&&(this._isInitial=!1),this._isInitial}}class p extends c{constructor(e){super(e.url),this._isInitial=!0}async fetchVersion(){return s.fromString("0.0.0","NETWORKUPDATE")}async handleOnline(e,t){if(!e)return new self.Response("cache is undefined");let i=await e.get(t);return i?self.fetch(t).then((i=>{e.put(t,i)})):(i=await self.fetch(t),e.put(t,i)),i}isInitialRequest(e){return this._isInitial&&(this._isInitial=!1),this._isInitial}}class d extends c{constructor(e){super(e.urls),this.aUrls=e.urls,this.sVersion=e.version,this._isInitial=!0}isInitialRequest(e){return this._isInitial&&(this._isInitial=!1),this._isInitial}async fetchVersion(){return s.fromString(this.sVersion,"PRE")}async init(){await super.init();const e=this.aUrls.map((e=>this.handleOnline(this.getCache(),e)));await Promise.all(e)}}class m{constructor(){this.strategies=[]}addStrategy(e){e.priority=e.priority||0,this.strategies.push(e),e.priority&&this.strategies.sort(((e,t)=>e.priority===t.priority?0:t.priority>e.priority?1:-1))}static async ensureStrategyIsInitialized(e){e._version||(a.getLogger().log("Strategy init called"),await e.init())}getStrategy(e){return this.strategies.find((t=>{if(t.matches(e))return t}))}async applyStrategy(e){const t=this.getStrategy(e.url);return t?(t.isInitialRequest(e.url)&&await t.init(),await m.ensureStrategyIsInitialized(t),t.applyStrategy(e)):self.fetch(e)}static create(){return new m}}class y{constructor(){this.clientMessageHandler=void 0}setClientMessageHandler(e){a.getLogger().log("client message handler set"),this.clientMessageHandler=e}async sentMessageToClient2(e,t){return new Promise((function(i,s){var r=new MessageChannel;r.port1.onmessage=function(e){e.data.error?s(e.data.error):i(e.data)},e.postMessage("SW Says: '"+t+"'",[r.port2])}))}async sendMessageToClient(e,t){return e.postMessage({msg:t})}async sendMessageToAllClients(e){const t=(await clients.matchAll()).map((t=>this.sendMessageToClient(t,e)));return await Promise.all(t)}handleClientMessage(e,t){this.clientMessageHandler?this.clientMessageHandler(e,t):a.getLogger().log("Unhandled Client message received: "+e.data)}static create(){return new y}}const w=m.create(),S=y.create(),v={};self.addEventListener("install",(e=>{self.skipWaiting()})),self.addEventListener("activate",(e=>{self.clients.claim()})),self.addEventListener("fetch",(e=>{a.getLogger().log("FETCH "+e.request.url),e.respondWith(async function(){try{const t=e.request;return await w.applyStrategy(t)}catch(e){throw a.getLogger().error("Error in fetch: ",e),e}}())})),self.addEventListener("message",(e=>{S.handleClientMessage(e,v)}));const x=S.setClientMessageHandler.bind(S),_=S.sendMessageToAllClients.bind(S),b=w.addStrategy.bind(w),E=c,C={CacheAllStrategy:g,UI5ResourceCacheStrategy:u,ApplicationCacheStrategy:h,PreCacheStrategy:d,CacheWithExpirationStrategy:f,CacheNetworkUpdateStrategy:p},I="0.0.1",M=async(e={})=>{const t=await l.loadFromManifest(e.manifestUrl);await j(t)},j=async e=>{const t=e.map((e=>{const t=Object.assign({},e),i=t.type;if(!i)throw new Error('type not specified. Must be a function, an instance of CacheStrategyBase or one of ["application", "ui5resource", "static", "precache", "networkupdate"]');let s;if(delete t.type,"object"==typeof i)s=i;else if("function"==typeof i&&i.constructor)s=new i(t);else if("string"==typeof i)switch(i.toLowerCase()){case"application":s=new h(t);break;case"ui5resource":s=new u(t);break;case"static":s=new g(t);break;case"precache":s=new d(t);break;case"networkupdate":s=new p(t);break;case"expiration":s=new f(t);break;default:throw new Error(`Cannot find strategy: ${i}. Allowed values are: ["application", "ui5resource", "static", "precache", "networkupdate"]`)}if(s instanceof E)return t.priority&&(s.priority=t.priority),w.addStrategy(s),s.init();throw new Error("Strategy must be of type CacheStrategyBase")}));await Promise.all(t);const i=e.map((e=>{if("string"==typeof e.type)return e.type}));v.init=i},R=()=>{a.enable()};self.worker=t})();