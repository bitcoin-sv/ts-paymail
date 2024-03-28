import { PublicProfileRoute } from '../../../src/paymailRouter/index.js'
import { fetchUser } from '../mockUser.js';

const publicProfileRoute = new PublicProfileRoute({
  domainLogicHandler: async (name, domain) => {
    const user = await fetchUser(name, domain)
    return {
      name: user.getAlias(),
      domain,
      avatar: user.getAvatarUrl()
    }
  }
})

export default publicProfileRoute
