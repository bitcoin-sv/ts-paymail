import Capability from './route.js';
import { RequestHandler } from 'express';
import { PublicProfileCapability } from '../../capabilityDefinition/capabilityDefinition.js';

interface PublicProfileResponse {
    avatarUrl: string;
    name: string;
}

export class PublicProfileRoute extends Capability  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/public-profile/:paymail') {
        super(PublicProfileCapability, endpoint, 'GET', domainLogicHandler, false);
    }
    
    protected serializeResponse(domainLogicResponse: PublicProfileResponse): string {
        return JSON.stringify({
            avatarUrl: domainLogicResponse.avatarUrl,
            name: domainLogicResponse.name,
        });
    }
}
