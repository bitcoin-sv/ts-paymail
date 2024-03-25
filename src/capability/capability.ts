import { Hash } from '@bsv/sdk'

export default class Capability {
  private readonly code?: string
  private readonly title: string
  private readonly authors?: string[]
  private readonly version?: string
  private readonly supersedes?: string[]
  private readonly method?: 'GET' | 'POST'

  constructor ({
    code,
    title,
    authors,
    version,
    supersedes,
    method
  }: {
    code?: string
    title: string
    authors?: string[]
    version?: string
    supersedes?: string[]
    method?: 'GET' | 'POST'
  }) {
    if (!title) throw new Error('Capability requires a title')
    this.code = code
    this.title = title
    this.authors = authors || []
    this.version = version
    this.supersedes = supersedes
    this.method = method
  }

  public getCode (): string {
    return this.code || this.bfrc()
  }

  public getMethod (): 'GET' | 'POST' {
    return this.method || 'GET'
  }

  private bfrc () {
    const stringToHash = [this.title.trim() + this.authors.join(', ').trim() + (this.version?.toString() || '')].join('').trim()
    const bufferHash = new Hash.SHA256().update(new Hash.SHA256().update(stringToHash).digest()).digest()
    const hash = bufferHash.reverse()
    return Buffer.from(hash).toString('hex').substring(0, 12)
  }
}
