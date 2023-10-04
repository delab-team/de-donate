import { ProviderTonConnect } from '@delab-team/ton-network-react'
import { TonConnectUI } from '@tonconnect/ui'
import { Address, beginCell, toNano, Cell } from '@ton/core'
import { TonClient } from 'ton'
import { Deployer } from './wrappers/Deployer'
import { DeployerHex, Fundraiser, Helper, JettonWallet } from './build'

export class Smart {
    private _wallet: TonConnectUI

    private _client: TonClient

    private _provider: ProviderTonConnect

    constructor (wallet: TonConnectUI, isTestnet: boolean) {
        this._wallet = wallet

        this._client = new TonClient({
            endpoint: isTestnet
                ? 'https://testnet.tonhubapi.com/jsonRPC'
                : 'https://mainnet.tonhubapi.com/jsonRPC'
        })

        this._provider = new ProviderTonConnect(this._wallet, isTestnet)
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

    public async deployDeployer (address: string, value: bigint): Promise<Address | undefined> {
        const deployerConfig = {
            admin: Address.parse(address),
            feeReceiver: Address.parse(address),
            feePercentage: 100,
            fundraiserCode: Cell.fromBoc(Buffer.from(Fundraiser, 'hex'))[0],
            helperCode: Cell.fromBoc(Buffer.from(Helper, 'hex'))[0],
            index: 0n,
            jettonWalletCode: Cell.fromBoc(Buffer.from(JettonWallet, 'hex'))[0],
            collectionContent: beginCell().storeUint(0, 8).endCell()
        }

        const deployerCode = Cell.fromBoc(Buffer.from(DeployerHex, 'hex'))[0]
        const deployer = Deployer.createFromConfig(deployerConfig, deployerCode)

        try {
            await deployer.sendDeploy(this._provider, toNano('0.05'), value)

            await this._provider.waitForDeploy(deployer.address)

            return deployer.address
        } catch (error) {
            console.error('deployDeployer', error)
            return undefined
        }
    }

    public async deployFundraiser (address: string): Promise<Address | undefined> {
        const deployer = Deployer.createFromAddress(Address.parse(address))

        try {
            await deployer.sendDeployFundraiser(
                this._provider,
                toNano('0.05'),
                123n,
                toNano('100'),
                1600000000n,
                'ipfs://qwe',
                Address.parse(address)
            )

            return deployer.address
        } catch (error) {
            console.error('deployFundraiser', error)
            return undefined
        }
    }
}
