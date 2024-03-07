import { Hash } from '@bsv/sdk'; 

export default class CapabilityDefinition {
    code?: string;
    title: string;
    authors?: string[];
    version?: string;
    supersedes?: string[];

    constructor({
        code,
        title,
        authors,
        version,
        supersedes
    }: {
        code?: string;
        title: string;
        authors?: string[];
        version?: string;
        supersedes?: string[];
    }) {
        if(!title) throw new Error('CapabilityDefinition requires a title');
        this.code = code;
        this.title = title;
        this.authors = authors;
        this.version = version;
        this.supersedes = supersedes;
    }

    public getCode(): string {
        return this.code || this.bfrc();
    }

    private bfrc() {
        const stringToHash = [this.title.trim() + this.authors.join(', ').trim() + (this.version.toString() || '')].join('').trim();
        const bufferHash = new Hash.SHA256().update(new Hash.SHA256().update(stringToHash).digest()).digest();
        const hash = bufferHash.reverse();
        return Buffer.from(hash).toString('hex').substring(0, 12);
    }
}


const PublicProfileCapability = new CapabilityDefinition({
    title: 'Public Profile (Name & Avatar)',
    authors: ['Ryan X. Charles (Money Button)'],
    version: '1'
});

const PublicKeyInfrastructureCapability = new CapabilityDefinition({
    title: 'Public Key Identity',
    code: 'pki',
});

const RequestSenderValidationCapability = new CapabilityDefinition({
    title: 'bsvalias Payment Addressing (Payer Validation)',
    authors: ['andy (nChain)'],
});

const VerifyPublicKeyOwnerCapability = new CapabilityDefinition({
    title: 'bsvalias public key verify (Verify Public Key Owner)',
});

const ReceiveTransactionCapability = new CapabilityDefinition({
    title: 'Receive Transaction',
    authors: ['Miguel Duarte (Money Button)', 'Ryan X. Charles (Money Button)', 'Ivan Mlinaric (Handcash)', 'Rafa (Handcash)'],
    version: '1.1',
});

const P2pPaymentDestinationCapability = new CapabilityDefinition({
    title: 'Get no monitored payment destination (p2p payment destination)',
    authors: ['Miguel Duarte (Money Button)', 'Ryan X. Charles (Money Button)', 'Ivan Mlinaric (Handcash)', 'Rafa (Handcash)'],
    version: '1.1',
});


export { PublicProfileCapability, PublicKeyInfrastructureCapability, RequestSenderValidationCapability, VerifyPublicKeyOwnerCapability, ReceiveTransactionCapability, P2pPaymentDestinationCapability};
