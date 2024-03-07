import express, { Router, ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import Route from './routes/route.js';
import { RequestSenderValidationCapability } from  '../capabilityDefinition/capabilityDefinition.js';

class PaymailRouter {
    private router: Router;
    public baseUrl: string;
    public routes: Route[];
    public requestSenderValidation: boolean;

    constructor(baseUrl: string, routes: Route[], errorHandler?: ErrorRequestHandler, requestSenderValidation?: boolean) {
        this.baseUrl = baseUrl;
        this.router = express.Router();
        this.router.use(bodyParser.json({  type: 'application/json' }))
        this.routes = routes;
        this.requestSenderValidation = requestSenderValidation;

        routes.forEach(route => {
            const method = route.getMethod();
            if (method === 'GET') {
                this.router.get(route.getEndpoint(), route.getHandler());
            } else if (method === 'POST') {
                this.router.post(route.getEndpoint(), route.getHandler());
            } else {
                throw new Error('Unsupported method: ' + method);
            }
        });
        this.addWellKnownRouter();
        if (errorHandler) {
            this.router.use(errorHandler);
        }
    }

    private addWellKnownRouter(): void {
        this.router.get('/.well-known/bsvalias', (req, res) => {
            const capabilities = this.routes.reduce((map, route) => {
                map[route.getCode()] = this.joinUrl(this.baseUrl, route.getEndpoint());
                return map;
            }, {});
            capabilities[RequestSenderValidationCapability.getCode()] = !!this.requestSenderValidation;
            res.type('application/json');
            res.send({
                bsvalias: '1.0',
                capabilities,
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
