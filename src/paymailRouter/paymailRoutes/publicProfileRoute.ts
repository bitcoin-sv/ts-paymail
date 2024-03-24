import PaymailRoute from './paymailRoute.js'
import { RequestHandler } from 'express'
import PublicProfileCapability from '../../capability/publicProfileCapability.js'

interface PublicProfileResponse {
  avatar: string
  name: string
}

export default class PublicProfileRoute extends PaymailRoute {
  constructor (domainLogicHandler: RequestHandler, endpoint = '/public-profile/:paymail') {
    super(PublicProfileCapability, endpoint, domainLogicHandler)
  }

  protected serializeResponse (domainLogicResponse: PublicProfileResponse): string {
    return JSON.stringify({
      avatar: domainLogicResponse.avatar,
      name: domainLogicResponse.name
    })
  }
}
