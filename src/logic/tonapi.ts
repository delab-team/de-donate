/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable max-len */
import axios from 'axios'

interface Attribute {
    trait_type: undefined | string,
    value: undefined | string
}

interface Collection {
    address: string,
    metadata: undefined | {
        cover_image: string | undefined,
        description: string | undefined,
        external_link: any | undefined,
        external_url: string | undefined,
        image: string | undefined,
        marketplace: string | undefined,
        name: string | undefined,
        social_links: string[] | undefined
    },
    next_item_index: number,
    owner: undefined | {
        address: string,
        icon: string,
        is_scam: boolean,
        name: string
    },
    raw_collection_content: string
}

interface Item {
    address: string,
    approved_by: any,
    collection: undefined | {
        address: string,
        name: string
    },
    collection_address: string | any,
    index: number,
    verified: boolean,
    metadata: {
        name: string | undefined,
        marketplace: string | undefined,
        image: string | undefined,
        description: string | undefined,
        attributes: undefined | Attribute[]
    },
    previews: {
        url: string
    }[] | undefined,
    owner: undefined | {
        address: string,
        is_scam: boolean
    },
    sale: undefined | {
        address: string,
        market: undefined | {
            address: string,
            icon: string,
            is_scam: boolean,
            name: string
        },
        owner: undefined | {
            address: string,
            icon: string,
            is_scam: boolean,
            name: string
        },
        price: {
            token_name: string,
            value: string
        }
    }
}

interface Items {
    nft_items: Item[]
}

interface Collections {
    nft_collections: Collection[]
}

interface Account {
    address: {
        bounceable: string,
        non_bounceable: string,
        raw: string
    },
    balance: number,
    icon: undefined | string,
    interfaces: any[],
    is_scam: boolean,
    last_update: number,
    memo_required: boolean,
    name: undefined | string,
    status: string
}

interface AccountV2 {
    address: string,
    balance: number,
    icon: undefined | string,
    interfaces: any[],
    is_scam: boolean,
    last_activity: number,
    memo_required: boolean,
    name: undefined | string,
    status: string,
    get_methods: any[]
}

interface AccountSmall {
    address: string,
    name?: string,
    is_scam: boolean,
    icon?: string
}

interface Message {
    created_lt: string,
    ihr_disabled: boolean,
    bounce: boolean,
    bounced: boolean,
    value: string,
    fwd_fee: number,
    ihr_fee: number,
    destination?: AccountSmall,
    source?: AccountSmall,
    import_fee: number,
    created_at: number,
    op_code?: string,
    init?: { boc: string },
    raw_body?: string,
    decoded_op_name?: string,
    decoded_body: any
}

interface Transaction {
    hash: string,
    lt: string,
    account: AccountSmall,
    success: boolean,
    utime: number,
    orig_status: string,
    end_status: string,
    total_fees: number,
    transaction_type: string,
    state_update_old: string,
    state_update_new: string,
    in_msg?: Message,
    out_msgs?: Message[],
    block: string,
    prev_trans_hash?: string,
    prev_trans_lt?: string,
    compute_phase?: any,
    storage_phase?: any,
    credit_phase?: any,
    action_phase?: any,
    bounce_phase?: any,
    aborted: boolean,
    destroyed: boolean
}

interface Transactions {
    transactions: Transaction[]
}

export class TonApi {
    private _url: string = 'https://tonapi.io/v1/'

    private _url2: string = 'https://tonapi.io/v2/'

    private _urlTest: string = 'https://testnet.tonapi.io/v1/'

    private _url2Test: string = 'https://testnet.tonapi.io/v2/'

    private _network: 'testnet' | 'mainnet'

    constructor (network: 'testnet' | 'mainnet') {
        this._network = network
    }

    // private _token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjI0Iiwic2NvcGUiOiJjbGllbnQifQ.vvtwTq9kO89CNP2635wImtrzshdrAM9AYaIbQNqfJHQ'

    private _token: string = 'AFXRKLZM2YCJ67AAAAAE4XDRSACSYEOYKQKOSUVUKMXNMP2AKUTWJ2UVBPTTQZWRGZMLALY'

    public async send (url: string, data: any, type = false): Promise<any | undefined> {
        let urlFull
        if (this._network === 'mainnet' && type === false) {
            urlFull = this._url
        }
        if (this._network === 'testnet' && type === false) {
            urlFull = this._urlTest
        }
        if (this._network === 'testnet' && type === true) {
            urlFull = this._url2Test
        }
        if (this._network === 'mainnet' && type === true) {
            urlFull = this._url2
        }
        console.log('url', urlFull)
        const res = await axios.get(`${urlFull}${url}?${new URLSearchParams(data)}`, { headers: { Authorization: `Bearer ${this._token}` } })

        if (res.data.error) {
            console.error(res.data.result)
            return undefined
        }
        return res.data
    }

    public async getItems (address: string): Promise<Items | undefined> {
        const data = await this.send('nft/getItems', { addresses: address })

        console.log(data)
        return data
    }

    public async getCollection (address: string): Promise<Collection | undefined> {
        const data = await this.send('nft/getCollection', { account: address })

        console.log(data)
        return data
    }

    public async getCollectionV2 (address: string): Promise<Collection | undefined> {
        const data = await this.send(`nfts/collections/${address}`, { }, true)

        console.log(data)
        return data
    }

    public async getCollections (limit: number = 100, offset: number = 0): Promise<Collections | undefined> {
        const data = await this.send('nft/getCollections', { limit, offset })

        console.log(data)
        return data
    }

    public async getCollectionsV2 (limit: number = 100, offset: number = 0): Promise<Collections | undefined> {
        const data = await this.send('nfts/collections', { limit, offset }, true)

        console.log(data)
        return data
    }

    public async searchItems (address: string, limit: number = 100, offset: number = 0): Promise<Items | undefined> {
        const data = await this.send('nft/searchItems', { collection: address, limit, offset })

        console.log(data)
        return data
    }

    public async searchItemsFromUser (address: string, limit: number = 100, offset: number = 0): Promise<Items | undefined> {
        const data = await this.send('nft/searchItems', { owner: address, limit, offset, include_on_sale: true })

        console.log(data)
        return data
    }

    public async searchItemsfull (limit: number = 100, offset: number = 0): Promise<Items | undefined> {
        const data = await this.send('nft/searchItems', { limit, offset })

        console.log(data)
        return data
    }

    public async getInfoUser (address: string): Promise<Account | undefined> {
        const data = await this.send('account/getInfo', { account: address })

        console.log(data)
        return data
    }

    public async getInfoUserV2 (address: string): Promise<AccountV2 | undefined> {
        const data = await this.send(`accounts/${address}`, { }, true)

        console.log(data)
        return data
    }

    public async getTransactionsV2 (address: string): Promise<Transactions | undefined> {
        const data = await this.send(`blockchain/accounts/${address}/transactions`, { before_lt: 0, limit: 100 }, true)

        console.log(data)
        return data
    }

    public async getItemsV2 (address: string): Promise<Items | undefined> {
        const data = await this.send(`nfts/collections/${address}/items`, { limit: 100, offset: 0 }, true)

        console.log(data)
        return data
    }
}

export type { Items, Item, Collection, Collections, Account, AccountV2, Transactions, Transaction }
