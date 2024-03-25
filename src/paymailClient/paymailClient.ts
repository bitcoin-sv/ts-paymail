import AbstractResolver from './resolver/abstractResolver.js'
import DNSResolver, { DNSResolverOptions } from './resolver/dnsResolver.js'
import HttpClient from './httpClient.js'
import Capability from '../capability/capability.js'

import PublicProfileCapability from '../capability/publicProfileCapability.js'
import PublicKeyInfrastructureCapability from '../capability/pkiCapability.js'
import P2pPaymentDestinationCapability from '../capability/p2pPaymentDestinationCapability.js'
import ReceiveTransactionCapability from '../capability/p2pReceiveTransactionCapability.js'
import VerifyPublicKeyOwnerCapability from '../capability/verifyPublicKeyOwnerCapability.js'

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

    if (!response.ok) {
      throw new Error(`Failed to fetch well-known for "${aDomain}" with URL: ${url}`)
    }

    const json = await response.json()
    if (json.bsvalias !== '1.0') throw new Error(`Domain "${aDomain}" is not on bsvalias version 1.0`)
    if (!json.capabilities) throw new Error(`Domain "${aDomain}" invalid response does not have any capabilities`)

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
      throw new Error(`Domain "${aDomain}" does not support capability "${aCapability}"`)
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
    return capability.validateBody(responseBody)
  }

  public getPublicProfile = async (paymail) => {
    return await this.request(paymail, PublicProfileCapability)
  }

  public getPki = async (paymail) => {
    return await this.request(paymail, PublicKeyInfrastructureCapability)
  }

  public getP2pPaymentDestination = async (paymail, satoshis: number) => {
    const response = await this.request(paymail, P2pPaymentDestinationCapability, {
      satoshis
    })
    if (satoshis !== response.outputs.reduce((acc, output) => acc + output.satoshis, 0)) {
      throw new Error('The server did not return the expected amount of satoshis')
    }
    return response
  }

  public sendTransactionP2P = async (paymail: string, txHex: string, reference: string, metadata?: {
    sender: string
    pubkey: string
    signature: string
    note: string
  }) => {
    return await this.request(paymail, ReceiveTransactionCapability, {
      txHex,
      reference,
      metadata
    })
  }

  public verifyPublicKey = async (paymail, pubkey) => {
    const [name, domain] = paymail.split('@')
    const url = await this.ensureCapabilityFor(domain, VerifyPublicKeyOwnerCapability.getCode())
    const requestUrl = url.replace('{alias}', name).replace('{domain.tld}', domain).replace('{pubkey}', pubkey)
    const response = await this.httpClient.request(requestUrl)
    const responseBody = await response.json()
    return VerifyPublicKeyOwnerCapability.validateBody(responseBody)
  }
}
