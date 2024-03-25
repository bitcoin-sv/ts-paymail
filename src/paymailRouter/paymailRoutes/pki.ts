import PaymailRoute from './paymailRoute.js'
import { RequestHandler } from 'express'
import PublicKeyInfrastructureCapability from '../../capability/pkiCapability.js'

interface PkiResponse {
  bsvalias: '1.0'
  handle: string
  pubkey: string
}

export default class PublicKeyInfrastructureRoute extends PaymailRoute {
  constructor (domainLogicHandler: RequestHandler, endpoint = '/id/:paymail') {
    super(PublicKeyInfrastructureCapability, endpoint, domainLogicHandler)
  }

  protected serializeResponse (domainLogicResponse: PkiResponse): string {
    return JSON.stringify({
      bsvalias: '1.0',

      handle: domainLogicResponse.handle,
      pubkey: domainLogicResponse.pubkey
    })
  }
}
