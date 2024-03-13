import DohResolver from '../../../dist/cjs/src/client/resolver/dohResolver.js';

import { describe, beforeAll, it, expect } from '@jest/globals';

describe('#DOHResolver - DNS over https Resolution', () => {
    let dnsClient: DohResolver;

    beforeAll(() => {
        dnsClient = new DohResolver();
    });

    it('should resolve SRV records for handcash.io', async () => {
        const result = await dnsClient.queryBsvaliasDomain('handcash.io');
        expect(result.domain).toBe('cloud.handcash.io');
        expect(result.port).toBe(443);
    });

    it('should resolve SRV records for tokenized', async () => {
        const result = await dnsClient.queryBsvaliasDomain('relysia.com');
        expect(result.domain).toBe('relysia.com');
        expect(result.port).toBe(443);
    });

});
