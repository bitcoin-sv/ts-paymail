import express from 'express';
import PaymailRouter from '../src/router/router.js';
import { PublicProfileRoute } from '../src/router/routes/publicProfileRoute.js';
import { mockUser1 } from './mockUser.js';
const app = express();

const baseUrl = 'http://localhost:3000';

const publicProfileRoute = new PublicProfileRoute((name, domain) => {
    if (name === mockUser1.getAlias()) {
        return {
            name: mockUser1.getAlias(),
            domain,
            avatarUrl: mockUser1.getAvatarUrl()
        }
    }
    throw new Error('User not found')
})

const routes = [publicProfileRoute];

const paymailRouter = new PaymailRouter(baseUrl, routes);

app.use(paymailRouter.getRouter());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
