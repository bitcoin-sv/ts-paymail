import express, { Router, ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import Capability from './capability.js';

class PaymailRouter {
    private router: Router;
    public baseUrl: string;
    public capabilities: Capability[];

    constructor(baseUrl: string, capabilities: Capability[], errorHandler?: ErrorRequestHandler) {
        this.baseUrl = baseUrl;
        this.router = express.Router();
        this.router.use(bodyParser.json({  type: 'application/json' }))
        this.capabilities = capabilities;

        capabilities.forEach(capability => {
            this.router.get(capability.getEndpoint(), capability.getHandler());
        });
        this.addWellKnownRouter();
        if (errorHandler) {
            this.router.use(errorHandler);
        }
    }

    private addWellKnownRouter(): void {
        this.router.get('/.well-known/bsvalias', (req, res) => {
            res.type('application/json');
            res.send({
                bsvalias: '1.0',
                capabilities: this.capabilities.reduce((map, capability) => {
                    map[capability.getCode()] = this.joinUrl(this.baseUrl, capability.getEndpoint());
                    return map;
                }, {})
            });
        });
    }

    private joinUrl(...parts: string[]): string {
        return parts.map(part => part.replace(/(^\/+|\/+$)/g, '')).join('/');
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default PaymailRouter;
