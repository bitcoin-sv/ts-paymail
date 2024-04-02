import AbstractResolver from './resolver/abstractResolver.js'
import DNSResolver, { DNSResolverOptions } from './resolver/dnsResolver.js'
import HttpClient from './httpClient.js'
import Capability from '../capability/capability.js'
import Joi from 'joi'
import { PaymailServerResponseError } from '../errors/index.js'
import { PrivateKey, ECDSA, BigNumber, Hash } from '@bsv/sdk'
import PublicProfileCapability from '../capability/publicProfileCapability.js'
import PublicKeyInfrastructureCapability from '../capability/pkiCapability.js'
import P2pPaymentDestinationCapability from '../capability/p2pPaymentDestinationCapability.js'
import ReceiveTransactionCapability from '../capability/p2pReceiveTransactionCapability.js'
import VerifyPublicKeyOwnerCapability from '../capability/verifyPublicKeyOwnerCapability.js'
import ReceiveBeefTransactionCapability from '../capability/p2pReceiveBeefTransactionCapability.js'
const { sha256 } = Hash

/**
 * PaymailClient provides functionality to interact with BSV Paymail services.
 * It offers methods to retrieve public profiles, verify public keys, send transactions, etc.
 */
export default class PaymailClient {
  // Cache for storing domain capabilities.
  private readonly _domainCapabilityCache: Map<string, Map<string, any>>

  // Resolver for handling DNS queries.
  private readonly _resolver: AbstractResolver

  // Local port for development purposes. Defaults to 3000.
  private readonly _localHostPort: number

  // HTTP client for making network requests.
  private readonly httpClient: HttpClient

  /**
   * Constructs a new PaymailClient.
   * @param httpClient - HTTP client for making network requests. If not provided, a default HttpClient is used.
   * @param dnsOptions - Configuration options for DNS resolution.
   * @param localhostPort - The port number for localhost development. Defaults to 3000 if not specified.
   */
  constructor (httpClient?: HttpClient, dnsOptions?: DNSResolverOptions, localhostPort?: number) {
    this.httpClient = httpClient || new HttpClient(fetch)
    this._domainCapabilityCache = new Map()
    this._resolver = new DNSResolver(dnsOptions, this.httpClient)
    this._localHostPort = localhostPort || 3000
  }

  /**
   * Fetches the well-known configuration for a Paymail domain.
   * @param aDomain - The domain to fetch the configuration for.
   * @returns The well-known configuration as a JSON object.
   */
  private readonly fetchWellKnown = async (aDomain: string): Promise<any> => {
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
    }).options({ stripUnknown: true })
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

  /**
 * Ensures that a specified domain supports a given capability.
 * @param aDomain - The domain to check for the capability.
 * @param aCapability - The capability to check for.
 * @returns The URL endpoint for the specified capability.
 * @throws PaymailServerResponseError - Thrown if the domain does not support the requested capability.
 */
  public ensureCapabilityFor = async (aDomain, aCapability) => {
    const capabilities = await this.getDomainCapabilities(aDomain)
    if (!capabilities[aCapability]) {
      throw new PaymailServerResponseError(`Domain "${aDomain}" does not support capability "${aCapability}"`)
    }
    return capabilities[aCapability]
  }

  /**
 * Makes a generic request to a Paymail service.
 * @param aDomain - The domain of the Paymail service.
 * @param capability - The capability being requested.
 * @param body - Optional request body.
 * @returns The response from the Paymail service.
 */
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

  /**
 * Retrieves the public profile associated with a Paymail address.
 * @param paymail - The Paymail address to fetch the profile for.
 * @returns The public profile including name and avatar.
 * @throws PaymailServerResponseError - Thrown if there is a validation error in the response.
 */
  public getPublicProfile = async (paymail) => {
    const response = await this.request(paymail, PublicProfileCapability)
    const schema = Joi.object({
      name: Joi.string().required(),
      avatar: Joi.string().uri().required()
    }).options({ stripUnknown: true })

    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  /**
 * Retrieves the public key infrastructure (PKI) data for a given Paymail address.
 * @param paymail - The Paymail address to fetch the PKI data for.
 * @returns PKI data including bsvalias, handle, and pubkey.
 * @throws PaymailServerResponseError - Thrown if there is a validation error in the response.
 */
  public getPki = async (paymail) => {
    const response = await this.request(paymail, PublicKeyInfrastructureCapability)
    const schema = Joi.object({
      bsvalias: Joi.string().optional().allow('1.0'),
      handle: Joi.string().required(),
      pubkey: Joi.string().required()
    }).options({ stripUnknown: true })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  /**
   * Requests a P2P payment destination for a given Paymail.
   * @param paymail - The Paymail address to request the payment destination for.
   * @param satoshis - The amount of satoshis for the transaction.
   * @returns An object containing the payment destination details.
   */
  public getP2pPaymentDestination = async (paymail: string, satoshis: number): Promise<any> => {
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
    }).options({ stripUnknown: true })
    const { error } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }

    if (satoshis !== response.outputs.reduce((acc, output) => acc + output.satoshis, 0)) {
      throw new PaymailServerResponseError('The server did not return the expected amount of satoshis')
    }
    return response
  }

  /**
 * Sends a transaction using the Pay-to-Peer (P2P) protocol.
 * This method is used to send a transaction to a Paymail address.
 *
 * @param paymail - The Paymail address to send the transaction to.
 * @param hex - The transaction in hexadecimal format.
 * @param reference - A reference identifier for the transaction.
 * @param metadata - Optional metadata for the transaction including sender, public key, signature, and note.
 * @returns A Promise that resolves to an object containing the transaction ID and an optional note.
 * @throws PaymailServerResponseError - Thrown if there is a validation error in the response.
 */
  public sendTransactionP2P = async (paymail: string, hex: string, reference: string, metadata?: {
    sender: string
    pubkey: string
    signature: string
    note: string
  }) => {
    const response = await this.request(paymail, ReceiveTransactionCapability, {
      hex,
      reference,
      metadata
    })

    const schema = Joi.object({
      txid: Joi.string().required(),
      note: Joi.string().optional().allow('')
    }).options({ stripUnknown: true })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }

  /**
   * Creates a digital signature for a P2P transaction using a given private key.
   * @param txid - The transaction ID to be signed.
   * @param privKey - The private key used for signing the transaction.
   * @returns A hex string representing the digital signature.
   */
  public createP2PSignature = (msg: string, privKey: PrivateKey): string => {
    const msgHash = new BigNumber(sha256(msg, 'hex'), 16)
    const sig = ECDSA.sign(msgHash, privKey, true)
    const recovery = sig.CalculateRecoveryFactor(privKey.toPublicKey(), msgHash)
    return sig.toCompact(recovery, true, 'base64') as string
  }

  /**
   * Verifies the ownership of a public key for a given Paymail address.
   * @param paymail - The Paymail address to verify the public key for.
   * @param pubkey - The public key to verify.
   * @returns An object containing verification results.
   * @throws PaymailServerResponseError - Thrown if there is an error in the verification process.
   */
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
    }).options({ stripUnknown: true })
    const { error } = schema.validate(responseBody)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return responseBody
  }

  /**
 * Sends a beef transaction using the Pay-to-Peer (P2P) protocol.
 * @param paymail - The Paymail address to which the transaction is sent.
 * @param beef - The transaction content in beef format.
 * @param reference - A reference identifier for the transaction.
 * @param metadata - Optional metadata including sender, public key, signature, and a note.
 * @returns The transaction ID and an optional note in the response.
 * @throws PaymailServerResponseError - Thrown if there is a validation error in the response.
 */
  public sendBeefTransactionP2P = async (paymail: string, beef: string, reference: string, metadata?: {
    sender: string
    pubkey: string
    signature: string
    note: string
  }) => {
    const response = await this.request(paymail, ReceiveBeefTransactionCapability, {
      beef,
      reference,
      metadata
    })
    const schema = Joi.object({
      txid: Joi.string().required(),
      note: Joi.string().optional().allow('')
    }).options({ stripUnknown: true })
    const { error, value } = schema.validate(response)
    if (error) {
      throw new PaymailServerResponseError(`Validation error: ${error.message}`)
    }
    return value
  }
}
