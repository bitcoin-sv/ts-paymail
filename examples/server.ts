import express from 'express';
import PaymailRouter from '../src/router/router.js';
import Capability from '../src/router/capability/capability.js';
import { PublicProfileCapability } from '../src/router/capability/publicProfileCapability.js';

const app = express();

const baseUrl = 'http://localhost:3000';
const capabilities = [
    new PublicProfileCapability((name, domain) => {
        return { name, domain, avatarUrl: `https://avatar.com/${name}@${domain}` };
    }),
];

const paymailRouter = new PaymailRouter(baseUrl, capabilities);

app.use(paymailRouter.getRouter());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
