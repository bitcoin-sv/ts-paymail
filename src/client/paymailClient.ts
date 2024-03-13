import AbstractResolver from "./resolver/abstractResolver.js";
import DohResolver from "./resolver/dohResolver.js";

export default class PaymailClient {
    private _domainCapabilityCache: Map<string, Map<string, any>>;
    private _resolver: AbstractResolver;
    private _localHostPort: number;

    constructor(dsnResolver?: AbstractResolver, localhostPort?: number) {
        this._domainCapabilityCache = new Map();
        this._resolver = dsnResolver || new DohResolver();
        this._localHostPort = localhostPort || 3000;
    }

    private fetchWellKnown = async (aDomain) => {
        const protocol = this.isDomainLocalHost(aDomain) ? 'http://' : 'https://';
        let domain, port;
        if (this.isDomainLocalHost(aDomain)) {
          domain = aDomain;
          port = this._localHostPort;
        } else {
          ({ domain, port } = await this._resolver.queryBsvaliasDomain(aDomain));
        }
        const response = await fetch(`${protocol}${domain}:${port}/.well-known/bsvalias`);
        if (!response.ok) {
          throw new Error(`Failed to fetch well-known for "${aDomain}"`);
        }
        return response.json();
      }

    
    isDomainLocalHost(aDomain) {
      return aDomain === 'localhost';
    };

    private getDomainCapabilities = async (aDomain) => {
        if (!this._domainCapabilityCache.has(aDomain)) {
          const capabilities = await this.fetchWellKnown(aDomain);
          this._domainCapabilityCache.set(aDomain, capabilities);
        }
        return this._domainCapabilityCache.get(aDomain);
      }

    public ensureCapabilityFor = async (aDomain, aCapability) => {
        const capabilities = await this.getDomainCapabilities(aDomain);
        if (!capabilities[aCapability]) {
          throw new Error(`Domain "${aDomain}" does not support capability "${aCapability}"`);
        }
    };
}