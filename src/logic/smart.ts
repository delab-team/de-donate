import { ProviderTonConnect } from '@delab-team/ton-network-react'
import { TonConnectUI } from '@tonconnect/ui'
import { Address, beginCell, toNano, Cell } from 'ton-core'
import { getHttpV4Endpoint } from '@orbs-network/ton-access'
import { TonClient, TonClient4 } from 'ton'
import { Deployer } from './wrappers/Deployer'
import { Fundraiser as FundraiserClass } from './wrappers/Fundraiser'
import { DeployerHex, Fundraiser, Helper, JettonWallet } from './build'

export class Smart {
    private _wallet: TonConnectUI

    // private _client: TonClient

    private _provider: ProviderTonConnect

    constructor (wallet: TonConnectUI, isTestnet: boolean) {
        this._wallet = wallet

        // getHttpEndpoint({ network: isTestnet ? 'testnet' : 'mainnet' }).then((endpoint) => {
        //     this._client = new TonClient4({ endpoint })
        // })

        // this._client = new TonClient({
        //     endpoint: isTestnet
        //         ? 'https://testnet.tonhubapi.com/jsonRPC'
        //         : 'https://mainnet.tonhubapi.com/jsonRPC'
        // })

        this._provider = new ProviderTonConnect(this._wallet, isTestnet)

        this._provider.sunc()
    }

    public static async getBalanceProfile (address: string, isTestnet: boolean): Promise<string> {
        try {
            const endpoint = await getHttpV4Endpoint({ network: isTestnet ? 'testnet' : 'mainnet' })

            const client = new TonClient4({ endpoint })
            const addr = await client.getAccount(0, Address.parse(address))
            return addr.account.balance.coins.toString()
        } catch (error) {
            return '0'
        }
    }

    public async deployDeployer (address: string): Promise<Address | undefined> {
        await this._provider.sunc()
        const deployer = this._provider.open(
            Deployer.createFromConfig(
                {
                    admin: Address.parse(address),
                    feeReceiver: Address.parse(address),
                    feePercentage: 100,
                    fundraiserCode: Cell.fromBoc(Buffer.from(Fundraiser, 'hex'))[0],
                    helperCode: Cell.fromBoc(Buffer.from(Helper, 'hex'))[0],
                    index: 0n,
                    jettonWalletCode: Cell.fromBoc(Buffer.from(JettonWallet, 'hex'))[0],
                    collectionContent: beginCell().storeUint(0, 8).endCell()
                },
                Cell.fromBoc(Buffer.from(DeployerHex, 'hex'))[0]
            )
        )

        try {
            await deployer.sendDeploy(this._provider.sender(), toNano('0.05'))

            await this._provider.waitForDeploy(deployer.address)

            return deployer.address
        } catch (error) {
            console.error('deployDeployer', error)
            return undefined
        }
    }

    public async deployFundraiser (addressDeployer: string, ipfs: string): Promise<Address | undefined> {
        await this._provider.sunc()
        const deployer = this._provider.open(Deployer.createFromAddress(Address.parse(addressDeployer)))

        try {
            await deployer.sendDeployFundraiser(
                this._provider.sender(),
                toNano('0.05'),
                123n,
                toNano('100'),
                1600000000n,
                ipfs,
                undefined
            )

            return deployer.address
        } catch (error) {
            console.error('deployFundraiser', error)
            return undefined
        }
    }

    public async sendClaim (addressFundraiser: string): Promise<true | undefined> {
        await this._provider.sunc() // обязательно перед каждой функией

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser)) // создаем класс контракта

        const fundraiser = this._provider.open(fundraiserContract) // открываем контракт для работы с ним

        try {
            await fundraiser.sendClaim(this._provider.sender(), toNano('0.05'), 123n) // отправляем нужный запрос

            return true
        } catch (error) {
            console.error('sendClaim', error)
            return undefined
        }
    }
}
