import AbstractResolver from './abstractResolver.js';
import HttpClient from '../httpClient.js';

export interface DNSResolverOptions {
  dns?: any;
  dohServerBaseUrl?: string;
}

class DNSResolver extends AbstractResolver {
    private dohServiceBaseUrl: string;
    private httpClient: HttpClient;
    private dns: any;

    constructor(options: DNSResolverOptions = {}, httpClient: HttpClient) {
        super();
        const { dns, dohServerBaseUrl = 'https://dns.google.com/resolve' } = options;
        this.dohServiceBaseUrl = dohServerBaseUrl;
        this.httpClient = httpClient;
        this.dns = dns;
    }

      async resolveSrv(aDomain: string): Promise<{ domain: string, port: number }> {
        // Try to resolve the domain using the local DNS server first if available (Node only)
        if (this.dns) {
          const result = await this.resolveWithDns(aDomain);
          if (result.isSecure){
            return {
              domain: result.domain,
              port: result.port
            }
          }
        }
          return this.resolveWithDoh(aDomain);

        }

        private domainWithoutBsvAliasPrefix(aDomain: string): string {
          return aDomain.replace('_bsvalias._tcp.', '');
        }

        domainsAreEqual(domain1, domain2) {
          return domain1.replace(/\.$/, '') === domain2.replace(/\.$/, '');
        }
      
        private async resolveWithDns(aDomain: string): Promise<any> {
          return new Promise((resolve) => {
              this.dns.resolveSrv(aDomain, (err, records) => {
                  if (err) {
                      if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
                          // Record not found, assume port 443 and domain is the same as the input per spec
                          resolve({
                              domain: this.domainWithoutBsvAliasPrefix(aDomain),
                              port: 443,
                              isSecure: true,
                          });
                      } else {
                          // Handle other types of errors
                          resolve({
                              domain: this.domainWithoutBsvAliasPrefix(aDomain),
                              port: 443,
                              isSecure: false,
                          });
                      }
                  } else {
                      const { name, port } = records[0];
                      const isSecure = this.domainsAreEqual(name, this.domainWithoutBsvAliasPrefix(aDomain));
                      resolve({ domain: name, port, isSecure });
                  }
              });
          });
      }

        private resolveWithDoh = async (aDomain: string): Promise<any> => {
          const response = await this.httpClient.request(`${this.dohServiceBaseUrl}?name=${aDomain}&type=SRV&cd=0`);
          const dohResponse = await response.json();

          // Record not found assume port 443 and domain is the same as the input per spec
          if (dohResponse.Status === 3 ) {
            return {
              domain: aDomain.replace('_bsvalias._tcp.', ''),
              port: 443
            }
          }
          if (dohResponse.Status !== 0 || !dohResponse.Answer) {
            throw new Error(`${this.domainWithoutBsvAliasPrefix(aDomain)} is not correctly configured: insecure domain`);
          }

          const data = dohResponse.Answer[0].data.split(' ');
          const port = data[2];
          let responseDomain = data[3];
          responseDomain = responseDomain.endsWith('.') ? responseDomain.slice(0, -1) : responseDomain;


          if (!dohResponse.AD && !this.domainsAreEqual(aDomain, responseDomain)) {
            throw new Error(`${this.domainWithoutBsvAliasPrefix(aDomain)} is not correctly configured: insecure domain`);
          }

          return {
            domain: responseDomain,
            port: parseInt(port)
          };

        };

        async queryBsvaliasDomain(aDomain) {
          return this.resolveSrv(`_bsvalias._tcp.${aDomain}`);
        }


}

export default DNSResolver;
