import Capability from './capability.js';
import { RequestHandler } from 'express';

// TODO hash the code using the bfrc spec
const code = 'f12f968c92d6';

interface PublicProfileResponse {
    avatarUrl: string;
    name: string;
}

export class PublicProfileCapability extends Capability  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/public-profile/:paymail') {
        super(code, endpoint, 'GET', domainLogicHandler, false);
    }
    
    protected serializeResponse(domainLogicResponse: PublicProfileResponse): string {
        return JSON.stringify({
            avatarUrl: domainLogicResponse.avatarUrl,
            name: domainLogicResponse.name,
        });
    }
}
