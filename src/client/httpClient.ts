type Fetch = typeof fetch;
type FetchOptions = RequestInit & { timeout?: number };

export default class HttpClient {
  private readonly fetch: Fetch;
  private readonly defaultTimeout: number;

  constructor(fetch: Fetch, defaultTimeout = 30000) {
    this.fetch = fetch;
    this.defaultTimeout = defaultTimeout;
  }

  async get(url: string, options: FetchOptions = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async postJson(url: string, body: any, options: FetchOptions = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
  }

  private async request(url: string, options: FetchOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout ?? this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const requestOptions = { ...options, signal: controller.signal };

    try {
      const response = await this.fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      throw new Error(`Fetch error: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

}