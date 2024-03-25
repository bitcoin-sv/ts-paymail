type Fetch = typeof fetch
type FetchOptions = RequestInit & { timeout?: number }
import { PaymailError } from "../errors/index.js";

export default class HttpClient {
  private readonly fetch: Fetch
  private readonly defaultTimeout: number

  constructor (fetch: Fetch, defaultTimeout = 30000) {
    this.fetch = fetch
    this.defaultTimeout = defaultTimeout
  }

  async request (
    url: string,
    options: (FetchOptions & { method: 'GET' | 'POST', body?: any }) = {
      method: 'GET'
    }
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = options.timeout ?? this.defaultTimeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const requestOptions: FetchOptions = {
      ...options,
      signal: controller.signal
    }

    if (options.method === 'POST' && options.body) {
      requestOptions.body = JSON.stringify(options.body)
      requestOptions.headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    try {
      const response = await this.fetch(url, requestOptions)
      if (!response.ok) {
        throw new PaymailError(await response.text(), 503)
      }
      return response
    } catch (error) {
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
