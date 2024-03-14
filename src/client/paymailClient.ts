import AbstractResolver from "./resolver/abstractResolver.js";
import DNSResolver, { DNSResolverOptions } from "./resolver/dnsResolver.js";

export default class PaymailClient {
    private _domainCapabilityCache: Map<string, Map<string, any>>;
    private _resolver: AbstractResolver;
    private _localHostPort: number;

    constructor(dnsOptions?: DNSResolverOptions, localhostPort?: number) {
        this._domainCapabilityCache = new Map();
        this._resolver =  new DNSResolver(dnsOptions);
        this._localHostPort = localhostPort || 3000;
    }

    private fetchWellKnown = async (aDomain) => {
      const isLocalHost = this.isDomainLocalHost(aDomain);
      const protocol = isLocalHost ? 'http://' : 'https://';
      let domain = aDomain;
      let port = isLocalHost ? this._localHostPort : null;
    
      if (!isLocalHost) {
        ({ domain, port } = await this._resolver.queryBsvaliasDomain(aDomain));
      }
    
      const url = `${protocol}${domain}:${port}/.well-known/bsvalias`;
      const response = await fetch(url);
    
      if (!response.ok) {
        throw new Error(`Failed to fetch well-known for "${aDomain}" with URL: ${url}`);
      }
    
      return response.json();
    }
    
    
    private isDomainLocalHost(aDomain) {
      return aDomain === 'localhost';
    }

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