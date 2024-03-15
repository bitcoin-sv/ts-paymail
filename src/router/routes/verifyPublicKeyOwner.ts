import PaymailRoute from './route.js';
import { RequestHandler } from 'express';
import VerifyPublicKeyOwnerCapability from 'src/capabilityDefinition/verifyPublicKeyOwnerCapability.js';

interface VerifyPublicKeyOwnerResponse {
    handle: string;
    pubkey: string;
    match: boolean;
}

export class VerifyPublicKeyOwnerRoute extends PaymailRoute  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/verifypubkey/{alias}@{domain.tld}/{pubkey}') {
        super(VerifyPublicKeyOwnerCapability, endpoint, domainLogicHandler);
    }
    
    protected serializeResponse(domainLogicResponse: VerifyPublicKeyOwnerResponse): string {
        return JSON.stringify({
            bsvalias: '1',
            // TODO get handle from params
            "handle": domainLogicResponse.handle,
            "pubkey": domainLogicResponse.pubkey,
            "match": domainLogicResponse.match
        });
    }
}
