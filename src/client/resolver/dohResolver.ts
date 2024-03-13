import AbstractResolver from './abstractResolver.js';
import HttpClient from '../httpClient.js';


class DohResolver extends AbstractResolver {
    private dohServiceBaseUrl: string;
    private httpClient: HttpClient;

    constructor(dohServerBaseUrl = 'https://dns.google.com/resolve') {
        super();
        this.dohServiceBaseUrl = dohServerBaseUrl;
        this.httpClient = new HttpClient(fetch);
    }

      async resolveSrv(aDomain: string): Promise<{ domain: string, port: number }> {
          const response = await this.httpClient.get(`${this.dohServiceBaseUrl}?name=${aDomain}&type=SRV&cd=0`);
          const dohResponse = await response.json();

          // Record not found assume port 443 and domain is the same as the input per spec
          if (dohResponse.Status === 3 ) {
            return {
              domain: aDomain.replace('_bsvalias._tcp.', ''),
              port: 443
            }
          }
          if (dohResponse.Status !== 0 || !dohResponse.Answer) {
            throw new Error(`${aDomain} is not correctly configured: insecure domain`);
          }

          const data = dohResponse.Answer[0].data.split(' ');
          const port = data[2];
          let responseDomain = data[3];
          responseDomain = responseDomain.endsWith('.') ? responseDomain.slice(0, -1) : responseDomain;


          if (!dohResponse.AD && !this.domainsAreEqual(aDomain, responseDomain)) {
            throw new Error(`${aDomain} is not correctly configured: insecure domain`);
          }

          return {
            domain: responseDomain,
            port: parseInt(port)
          };
        }

        isDomainLocalHost(aDomain) {
          return aDomain === 'localhost';
        };

        domainsAreEqual(domain1, domain2) {
          return domain1.replace(/\.$/, '') === domain2.replace(/\.$/, '');
        }
      

        async queryBsvaliasDomain(aDomain) {
          return this.resolveSrv(`_bsvalias._tcp.${aDomain}`);
        }


}

export default DohResolver;
