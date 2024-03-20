
Links: [API](#api), [Classes](#classes)

# Classes

| |
| --- |
| [P2pPaymentDestinationRoute](#class-p2ppaymentdestinationroute) |
| [PaymailRoute](#class-paymailroute) |
| [PaymailRouter](#class-paymailrouter) |
| [PublicKeyInfrastructureRoute](#class-publickeyinfrastructureroute) |
| [ReceiveTransactionRoute](#class-receivetransactionroute) |
| [VerifyPublicKeyOwnerRoute](#class-verifypublickeyownerroute) |

Links: [API](#api), [Classes](#classes)

---

## Class: PaymailRouter

Base Paymail Router to be added to your express application

```ts
export default class PaymailRouter {
    public baseUrl: string;
    public routes: Route[];
    public requestSenderValidation: boolean;
    constructor(baseUrl: string, routes: PaymailRoute[], errorHandler?: ErrorRequestHandler, requestSenderValidation?: boolean) 
    public getRouter(): Router 
}
```

### Usage

```ts
import express from 'express';
import PaymailRouter from '../src/router/router.js';
const app = express();
const baseUrl = 'http://localhost:3000';
const routes = [];
const paymailRouter = new PaymailRouter(baseUrl, routes);
app.use(paymailRouter.getRouter());
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

```

Links: [API](#api), [Classes](#classes)

---

## Class: PaymailRoute

Each Capability will extend the paymail with a new route

```ts
export default class PaymailRoute {
    constructor(private capability: Capability, private endpoint: string, private domainLogicHandler: RequestHandler, protected bodyValidator?: (body: any) => any) 
    protected async defaultHandler(req: Request, res: Response, next: NextFunction): Promise<any> 
    protected serializeResponse(response): string 
    protected sendSuccessResponse(res: Response, content: string): Response 
    public getHandler(): RequestHandler 
    public getCode(): string 
    public getEndpoint(): string 
    public getMethod(): "GET" | "POST" 
}
```

Links: [API](#api), [Classes](#classes)

---
## Class: P2pPaymentDestinationRoute

```ts
export default class P2pPaymentDestinationRoute extends PaymailRoute {
    constructor(domainLogicHandler: RequestHandler, endpoint = "/p2p-payment-destination/:paymail") 
    protected serializeResponse(domainLogicResponse: P2pDestinationsResponse): string 
}
```

Links: [API](#api), [Classes](#classes)

---
## Class: PublicKeyInfrastructureRoute

```ts
export default class PublicKeyInfrastructureRoute extends PaymailRoute {
    constructor(domainLogicHandler: RequestHandler, endpoint = "/id/:paymail") 
    protected serializeResponse(domainLogicResponse: PkiResponse): string 
}
```

Links: [API](#api), [Classes](#classes)

---
## Class: ReceiveTransactionRoute

```ts
export default class ReceiveTransactionRoute extends PaymailRoute {
    constructor(domainLogicHandler: RequestHandler, endpoint = "/receive-transaction/:paymail") 
    ReceiveTransactionResponse;
    protected serializeResponse(domainLogicResponse: ReceiveTransactionResponse): string 
}
```

Links: [API](#api), [Classes](#classes)

---
## Class: VerifyPublicKeyOwnerRoute

```ts
export default class VerifyPublicKeyOwnerRoute extends PaymailRoute {
    constructor(domainLogicHandler: RequestHandler, endpoint = "/verifypubkey/:paymail/:pubkey") 
    protected serializeResponse(domainLogicResponse: VerifyPublicKeyOwnerResponse): string 
}
```

Links: [API](#api), [Classes](#classes)

---
