import { Hash } from '@bsv/sdk'; 

export default class Capability {
    private code?: string;
    private title: string;
    private authors?: string[];
    private version?: string;
    private supersedes?: string[];
    private method?: 'GET' | 'POST';
    private responseBodyValidator?: (body: any) => any;

    constructor({
        code,
        title,
        authors,
        version,
        supersedes,
        responseBodyValidator,
        method,
    }: {
        code?: string;
        title: string;
        authors?: string[];
        version?: string;
        supersedes?: string[];
        method?: 'GET' | 'POST';
        responseBodyValidator?: (body: any) => any;
    }) {
        if(!title) throw new Error('Capability requires a title');
        this.code = code;
        this.title = title;
        this.authors = authors || [];
        this.version = version;
        this.supersedes = supersedes;
        this.method = method;
        this.responseBodyValidator = responseBodyValidator;
    }

    public getCode(): string {
        return this.code || this.bfrc();
    }

    public getMethod(): 'GET' | 'POST'{
        return this.method || 'GET';
    }

    public validateBody(body: any): any {
        if (this.responseBodyValidator) {
            return this.responseBodyValidator(body);
        }
        return body;
    }

    private bfrc() {
        const stringToHash = [this.title.trim() + this.authors.join(', ').trim() + (this.version?.toString() || '')].join('').trim();
        const bufferHash = new Hash.SHA256().update(new Hash.SHA256().update(stringToHash).digest()).digest();
        const hash = bufferHash.reverse();
        return Buffer.from(hash).toString('hex').substring(0, 12);
    }
}