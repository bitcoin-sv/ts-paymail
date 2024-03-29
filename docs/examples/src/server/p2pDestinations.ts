
import { P2pPaymentDestinationRoute } from '@bsv/ts-paymail'
import { fetchUser } from '../mockUser.js'

const p2pDestinationsRoute = new P2pPaymentDestinationRoute({
  domainLogicHandler: async (name, domain, body) => {
    const user = await fetchUser(name, domain)
    const { destinationScript, reference } = user.getPaymailDestination()
    return {
      outputs: [
        {
          script: destinationScript,
          satoshis: body.satoshis
        }
      ],
      reference
    }
  }
})

export default p2pDestinationsRoute
