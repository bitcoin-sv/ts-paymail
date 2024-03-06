import { Request, Response, RequestHandler } from 'express';

class Capability<DomainResponse> {
    private endpoint: string;
    private domainLogicHandler: RequestHandler;
    private code: string;
    private validateSignature: boolean;

    constructor(code: string, endpoint: string, domainLogicHandler: RequestHandler, validateSignature?: boolean) {
        this.endpoint = this.validateEndpoint(endpoint);
        this.domainLogicHandler = domainLogicHandler;
        this.code = this.validateCode(code);
        this.validateSignature = validateSignature;
    }

    private validateCode(code: string): string {
        if (!code || typeof code !== 'string') {
            throw new Error('Invalid code: Code must be a non-empty string.');
        }
        return code;
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
        const response = await this.domainLogicHandler(name, domain);
        const serializedResponse = this.serializeResponse(response as DomainResponse);
        return this.sendSuccessResponse(res, serializedResponse);
    }
    
    protected serializeResponse(response: DomainResponse): string {
        return JSON.stringify(response);
    }

    protected sendSuccessResponse(res: Response, content: string): string {
        return res.status(200).send(content);
    }

    public getHandler(): RequestHandler {
        return this.defaultHandler.bind(this);
    }

    public getCode(): string {
        return this.code;
    };
    
    public getEndpoint(): string {
        return this.endpoint;
    }

}

export default Capability;
