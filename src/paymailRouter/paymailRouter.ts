import express, { Router, ErrorRequestHandler } from 'express'
import bodyParser from 'body-parser'
import PaymailRoute from './paymailRoutes/paymailRoute.js'
import RequestSenderValidationCapability from '../capability/requestSenderValidationCapability.js'

export default class PaymailRouter {
  private readonly router: Router
  public baseUrl: string
  public routes: PaymailRoute[]
  public requestSenderValidation: boolean

  constructor (baseUrl: string, routes: PaymailRoute[], errorHandler?: ErrorRequestHandler, requestSenderValidation?: boolean) {
    this.baseUrl = baseUrl
    this.router = express.Router()
    this.router.use(bodyParser.json({ type: 'application/json' }))
    this.routes = routes
    this.requestSenderValidation = requestSenderValidation

    routes.forEach(route => {
      const method = route.getMethod()
      if (method === 'GET') {
        this.router.get(route.getEndpoint(), route.getHandler())
      } else if (method === 'POST') {
        this.router.post(route.getEndpoint(), route.getHandler())
      } else {
        throw new Error('Unsupported method: ' + method)
      }
    })
    this.addWellKnownRouter()
    if (errorHandler) {
      this.router.use(errorHandler)
    } else {
      this.router.use(this.defaultErrorHandler())
    }
  }

  private readonly defaultErrorHandler = () => {
    return (err, req, res, next) => {
      res.status(500).send(err.message)
    }
  }

  private addWellKnownRouter (): void {
    this.router.get('/.well-known/bsvalias', (req, res) => {
      const capabilities = this.routes.reduce((map, route) => {
        const endpoint = route.getEndpoint().replace(/:paymail/g, '{alias}@{domain.tld}').replace(/:pubkey/g, '{pubkey}')
        map[route.getCode()] = this.joinUrl(this.baseUrl, endpoint)
        return map
      }, {})
      capabilities[RequestSenderValidationCapability.getCode()] = !!this.requestSenderValidation
      res.type('application/json')
      res.send({
        bsvalias: '1.0',
        capabilities
      })
    })
  }

  private joinUrl (...parts: string[]): string {
    return parts.map(part => part.replace(/(^\/+|\/+$)/g, '')).join('/')
  }

  public getRouter (): Router {
    return this.router
  }
}
