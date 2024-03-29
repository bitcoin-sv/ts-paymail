
import { PublicKeyInfrastructureRoute } from '@bsv/ts-paymail'
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
