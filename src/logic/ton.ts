import { TonConnectUI } from '@tonconnect/ui'
import { TonClient, Address } from 'ton'

export class Ton {
    private _wallet: TonConnectUI

    private _client: TonClient

    constructor (wallet: TonConnectUI, isTestnet: boolean) {
        this._wallet = wallet

        this._client = new TonClient({
            endpoint: isTestnet
                ? 'https://testnet.tonhubapi.com/jsonRPC'
                : 'https://mainnet.tonhubapi.com/jsonRPC'
        })
    }

    public static async getBalanceProfile (address: string, isTestnet: boolean): Promise<string> {
        try {
            const client = new TonClient({
                endpoint: isTestnet
                    ? 'https://testnet.tonhubapi.com/jsonRPC'
                    : 'https://mainnet.tonhubapi.com/jsonRPC'
            })
            const bl = await client.getBalance(Address.parse(address))
            return bl.toString()
        } catch (error) {
            return '0'
        }
    }
}
