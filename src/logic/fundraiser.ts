/* eslint-disable no-continue */
import { Account, Collection, Item, TonApi, AccountV2, Transactions } from './tonapi'

export class FundraiserNFT {
    private _tonApi

    private _ipfs = 'https://cloudflare-ipfs.com/ipfs/'

    constructor () {
        this._tonApi = new TonApi()
    }

    public async getOneNft (address: string): Promise<{ nft: Item, collection: Collection | undefined } | undefined> {
        const data = await this._tonApi.getItems(address)

        if (!data) {
            return undefined
        }

        if (data.nft_items.length > 0) {
            const collection = data.nft_items[0].collection
                ? await this._tonApi.getCollection(data.nft_items[0].collection.address) : undefined

            const replaceData = data.nft_items
            for (let i = 0; i < replaceData.length; i++) {
                const oneData = replaceData[i]
                if (oneData.metadata === undefined) {
                    continue
                }
                oneData.metadata.image = replaceData[i].metadata?.image?.replace('ipfs://', this._ipfs)
                replaceData[i] = oneData
            }

            if (collection) {
                if (collection.metadata) collection.metadata.cover_image = collection.metadata?.cover_image?.replace('ipfs://', this._ipfs)
                if (collection.metadata) collection.metadata.image = collection.metadata?.image?.replace('ipfs://', this._ipfs)
            }

            return { nft: data.nft_items[0], collection }
        }
        return undefined
    }

    public async getCollection (address: string): Promise<Collection | undefined> {
        const data = await this._tonApi.getCollection(address)

        if (!data) {
            return undefined
        }

        if (data.metadata) data.metadata.cover_image = data.metadata?.cover_image?.replace('ipfs://', this._ipfs)
        if (data.metadata) data.metadata.image = data.metadata?.image?.replace('ipfs://', this._ipfs)
        return data
    }

    public async getUser (address: string): Promise<Account | undefined> {
        const data = await this._tonApi.getInfoUser(address)

        if (!data) {
            return undefined
        }
        return data
    }

    public async getUserV2 (address: string): Promise<AccountV2 | undefined> {
        const data = await this._tonApi.getInfoUserV2(address)

        if (!data) {
            return undefined
        }
        return data
    }

    public async getTransactionsV2 (address: string): Promise<Transactions | undefined> {
        const data = await this._tonApi.getTransactionsV2(address)

        if (!data) {
            return undefined
        }
        return data
    }

    public async getCollections (page: number = 0): Promise<Collection[] | undefined> {
        const limit = 100
        const off = page * limit
        const data = await this._tonApi.getCollectionsV2(limit, off) // ---

        if (!data) {
            return undefined
        }

        if (data.nft_collections.length > 0) {
            const replaceData = data.nft_collections
            for (let i = 0; i < replaceData.length; i++) {
                const oneData = replaceData[i]
                if (oneData.metadata === undefined) {
                    continue
                }
                oneData.metadata.cover_image = replaceData[i].metadata?.cover_image?.replace('ipfs://', this._ipfs)
                oneData.metadata.image = replaceData[i].metadata?.image?.replace('ipfs://', this._ipfs)
                replaceData[i] = oneData
            }

            return replaceData
        }
        return undefined
    }

    public async getItemsFromCollection (address: string, page: number = 0): Promise<Item[] | undefined> {
        const limit = 100
        const off = page * limit
        const data = await this._tonApi.searchItems(address, limit, off)

        if (!data) {
            return undefined
        }

        if (data.nft_items.length > 0) {
            const replaceData = data.nft_items
            for (let i = 0; i < replaceData.length; i++) {
                const oneData = replaceData[i]
                if (oneData.metadata === undefined) {
                    continue
                }
                oneData.metadata.image = replaceData[i].metadata?.image?.replace('ipfs://', this._ipfs)
                replaceData[i] = oneData
            }
            return replaceData
        }
        return undefined
    }

    public async getItemsFromUser (address: string, page: number = 0): Promise<Item[] | undefined> {
        const limit = 100
        const off = page * limit
        const data = await this._tonApi.searchItemsFromUser(address, limit, off)

        if (!data) {
            return undefined
        }

        if (data.nft_items.length > 0) {
            const replaceData = data.nft_items
            for (let i = 0; i < replaceData.length; i++) {
                const oneData = replaceData[i]
                if (oneData.metadata === undefined) {
                    continue
                }
                oneData.metadata.image = replaceData[i].metadata?.image?.replace('ipfs://', this._ipfs)
                replaceData[i] = oneData
            }
            return replaceData
        }
        return undefined
    }

    public async getAllItems (page: number = 0): Promise<Item[] | undefined> {
        const limit = 15
        const off = page * limit
        const data = await this._tonApi.searchItemsfull(limit, off)

        if (!data) {
            return undefined
        }

        if (data.nft_items.length > 0) {
            const replaceData = data.nft_items
            for (let i = 0; i < replaceData.length; i++) {
                const oneData = replaceData[i]
                if (oneData.metadata === undefined) {
                    continue
                }
                oneData.metadata.image = replaceData[i].metadata?.image?.replace('ipfs://', this._ipfs)
                replaceData[i] = oneData
            }
            return replaceData
        }
        return undefined
    }
}
