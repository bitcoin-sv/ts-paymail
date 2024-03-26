import AbstractResolver from './resolver/abstractResolver.js'
import DNSResolver, { DNSResolverOptions } from './resolver/dnsResolver.js'
import HttpClient from './httpClient.js'
import Capability from '../capability/capability.js'
import Joi from 'joi'
import { PaymailServerResponseError } from '../errors/index.js'

import PublicProfileCapability from '../capability/publicProfileCapability.js'
import PublicKeyInfrastructureCapability from '../capability/pkiCapability.js'
import P2pPaymentDestinationCapability from '../capability/p2pPaymentDestinationCapability.js'
import ReceiveTransactionCapability from '../capability/p2pReceiveTransactionCapability.js'
import VerifyPublicKeyOwnerCapability from '../capability/verifyPublicKeyOwnerCapability.js'
import ReceiveBeefTransactionCapability from '../capability/p2pReceiveBeefTransactionCapability.js'

export default class PaymailClient {
  private readonly _domainCapabilityCache: Map<string, Map<string, any>>
  private readonly _resolver: AbstractResolver
  private readonly _localHostPort: number
  private readonly httpClient: HttpClient

  constructor (httpClient?: HttpClient, dnsOptions?: DNSResolverOptions, localhostPort?: number) {
    this.httpClient = httpClient || new HttpClient(fetch)
    this._domainCapabilityCache = new Map()
    this._resolver = new DNSResolver(dnsOptions, this.httpClient)
    this._localHostPort = localhostPort || 3000
  }

  private readonly fetchWellKnown = async (aDomain) => {
    const isLocalHost = this.isDomainLocalHost(aDomain)
    const protocol = isLocalHost ? 'http://' : 'https://'
    let domain = aDomain
    let port = isLocalHost ? this._localHostPort : null

    if (!isLocalHost) {
      ({ domain, port } = await this._resolver.queryBsvaliasDomain(aDomain))
    }

    const url = `${protocol}${domain}:${port}/.well-known/bsvalias`
    const response = await fetch(url)
    const json = await response.json()
    const schema = Joi.object({
      bsvalias: Joi.string().required(),
      capabilities: Joi.object().required()
    })
    const { error } = schema.validate(json)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return json.capabilities
  }

  private isDomainLocalHost (aDomain) {
    return aDomain === 'localhost'
  }

  private readonly getDomainCapabilities = async (aDomain) => {
    if (!this._domainCapabilityCache.has(aDomain)) {
      const capabilities = await this.fetchWellKnown(aDomain)
      this._domainCapabilityCache.set(aDomain, capabilities)
    }
    return this._domainCapabilityCache.get(aDomain)
  }

  public ensureCapabilityFor = async (aDomain, aCapability) => {
    const capabilities = await this.getDomainCapabilities(aDomain)
    if (!capabilities[aCapability]) {
      throw new PaymailServerResponseError(`Domain "${aDomain}" does not support capability "${aCapability}"`)
    }
    return capabilities[aCapability]
  }

  public request = async (aDomain: string, capability: Capability, body?: any) => {
    const [name, domain] = aDomain.split('@')
    const url = await this.ensureCapabilityFor(domain, capability.getCode())
    const requestUrl = url.replace('{alias}', name).replace('{domain.tld}', domain)
    const response = await this.httpClient.request(requestUrl, {
      method: capability.getMethod(),
      body
    })
    const responseBody = await response.json()
    return responseBody
  }

  public getPublicProfile = async (paymail) => {
    const response = await this.request(paymail, PublicProfileCapability)
    const schema = Joi.object({
      name: Joi.string().required(),
      avatar: Joi.string().uri().required()
    })

    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  public getPki = async (paymail) => {
    const response = await this.request(paymail, PublicKeyInfrastructureCapability)
    const schema = Joi.object({
      bsvalias: Joi.string().optional().allow('1.0'),
      handle: Joi.string().required(),
      pubkey: Joi.string().required()
    })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  public getP2pPaymentDestination = async (paymail, satoshis: number) => {
    const response = await this.request(paymail, P2pPaymentDestinationCapability, {
      satoshis
    })

    const schema = Joi.object({
      outputs: Joi.array().items(
        Joi.object({
          script: Joi.string().required(),
          satoshis: Joi.number().required()
        }).required().min(1)),
      reference: Joi.string().required()
    })
    const { error } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }

    if (satoshis !== response.outputs.reduce((acc, output) => acc + output.satoshis, 0)) {
      throw new PaymailServerResponseError('The server did not return the expected amount of satoshis')
    }
    return response
  }

  public sendTransactionP2P = async (paymail: string, txHex: string, reference: string, metadata?: {
    sender: string
    pubkey: string
    signature: string
    note: string
  }) => {
    const response = await this.request(paymail, ReceiveTransactionCapability, {
      txHex,
      reference,
      metadata
    })

    const schema = Joi.object({
      txid: Joi.string().required(),
      note: Joi.string()
    })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  public verifyPublicKey = async (paymail, pubkey) => {
    const [name, domain] = paymail.split('@')
    const url = await this.ensureCapabilityFor(domain, VerifyPublicKeyOwnerCapability.getCode())
    const requestUrl = url.replace('{alias}', name).replace('{domain.tld}', domain).replace('{pubkey}', pubkey)
    const response = await this.httpClient.request(requestUrl)
    const responseBody = await response.json()

    const schema = Joi.object({
      bsvalias: Joi.string().optional().allow('1.0'),
      handle: Joi.string().required(),
      pubkey: Joi.string().required(),
      match: Joi.boolean().required()
    })
    const { error } = schema.validate(responseBody)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return responseBody
  }

  public sendBeefTransactionP2P = async (paymail: string, txHex: string, reference: string, metadata?: {
    sender: string
    pubkey: string
    signature: string
    note: string
  }) => {
    const response = await this.request(paymail, ReceiveBeefTransactionCapability, {
      txHex,
      reference,
      metadata
    })

    const schema = Joi.object({
      txid: Joi.string().required(),
      note: Joi.string()
    })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }
}
