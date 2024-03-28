import { PublicKeyInfrastructureRoute } from '../../../src/paymailRouter/index.js'
import { fetchUser } from '../mockUser.js'

const pkiRoute = new PublicKeyInfrastructureRoute({
  domainLogicHandler: async (name, domain) => {
    const user = await fetchUser(name, domain)
    return {
      bsvalias: '1.0',
      handle: `${name}@${domain}`,
      pubkey: user.getIdentityKey()
    }
  }
})

export default pkiRoute
