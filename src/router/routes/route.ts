import { Request, Response, RequestHandler } from 'express';
import CapabilityDefinition from 'src/capabilityDefinition/capabilityDefinition.js';

class Route {
    constructor(
        private capability: CapabilityDefinition, 
        private endpoint: string,
        private method: 'GET' | 'POST',
        private domainLogicHandler: RequestHandler,
        private validateSignature?: boolean,
        protected bodyValidator?: (body: any) => any
    ) 
        {
        this.endpoint = this.validateEndpoint(endpoint);
        this.domainLogicHandler = domainLogicHandler;
        this.validateSignature = validateSignature;
        this.method = method;
    }


    private validateEndpoint(endpoint: string): string {
        if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
            throw new Error('Invalid endpoint: Endpoint must be a non-empty string starting with "/".');
        }
        return endpoint;
    }

    private getNameAndDomainFromRequest(req: Request): { name: string, domain: string } {
        const [name, domain] = req.params.paymail.split('@')
        return { name, domain };
    }

    protected async defaultHandler(req: Request, res: Response): Promise<any> {
        const { name, domain } = this.getNameAndDomainFromRequest(req);
        if (this.validateSignature) {
            // validate signature
        }
        if (this.bodyValidator) {
            const body = this.bodyValidator(req.body);
            if (body instanceof Error) {
                return res.status(400).send(body.message);
            }
        }
        const response = await this.domainLogicHandler(name, domain, req.body);
        const serializedResponse = this.serializeResponse(response);
        return this.sendSuccessResponse(res, serializedResponse);
    }
    
    protected serializeResponse(response): string {
        return JSON.stringify(response);
    }

    protected sendSuccessResponse(res: Response, content: string): Response {
        return res.type('application/json').status(200).send(content);
      }      

    public getHandler(): RequestHandler {
        return this.defaultHandler.bind(this);
    }

    public getCode(): string {
        return this.capability.getCode();
    };
    
    public getEndpoint(): string {
        return this.endpoint;
    }

    public getMethod(): 'GET' | 'POST' {
        return this.method;
    }
}

export default Route
;
