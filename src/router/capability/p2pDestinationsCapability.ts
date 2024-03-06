import Capability from './capability.js';
import { RequestHandler } from 'express';
import joi from 'joi';

// TODO hash the code using the bfrc spec
const code = '2a40af698840';

interface P2pDestination {
    script: string;
    satoshis: number;
  }
  
  interface P2pDestinationsResponse {
    outputs: P2pDestination[];
    reference: string;
  }
  
export class P2pDestinationsCapability extends Capability  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/p2p-payment-destination/:paymail') {
        super(code, endpoint, 'POST', domainLogicHandler);
        this.bodyValidator = this.getBodyValidator();
    }

    private getBodyValidator(): (body: any) => any {
        return (body: any) => {
            const schema = joi.object({
                satoshis: joi.number().required(),
            });
            const { error, value } = schema.validate(body);
            if (error) {
                return new Error('Invalid body: ' + error.message);
            }
            return value;
        };
    }
    
    protected serializeResponse(domainLogicResponse: P2pDestinationsResponse): string {
        return JSON.stringify({
            outputs: domainLogicResponse.outputs.map(output => ({
                script: output.script,
                satoshis: output.satoshis,
            })),
            reference: domainLogicResponse.reference,
        });
    }
}
