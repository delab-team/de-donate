/* eslint-disable consistent-return */
import { ProviderTonConnect } from '@delab-team/ton-network-react'
import { TonConnectUI } from '@tonconnect/ui'
import { Address, beginCell, toNano, Cell, Dictionary, TupleReader, Sender } from 'ton-core'
import { getHttpV4Endpoint } from '@orbs-network/ton-access'
import { TonClient, TonClient4 } from 'ton'
import { BOC, Slice } from 'ton3'
import axios from 'axios'
import { JettonMinter } from './wrappers/JettonMinter'
import { Deployer } from './wrappers/Deployer'
import { Fundraiser as FundraiserClass } from './wrappers/Fundraiser'
import { JettonWallet as JettonWalletClass } from './wrappers/JettonWallet'
import { Helper as HelperClass } from './wrappers/Helper'
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
            let endpoint = await getHttpV4Endpoint({ network: isTestnet ? 'testnet' : 'mainnet' })

            if (!isTestnet) {
                endpoint = 'https://mainnet-v4.tonhubapi.com'
            }

            const client = new TonClient4({ endpoint })
            const addr = await client.getAccount(0, Address.parse(address))
            return addr.account.balance.coins.toString()
        } catch (error) {
            return '0'
        }
    }

    public async deployDeployer (address: string, ipfs: string): Promise<Address | undefined> {
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
                    collectionContent: beginCell().storeUint(1, 8).storeStringTail(ipfs).endCell()
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

    public async deployFundraiser (
        addressDeployer: string,
        ipfs: string,
        priorityCoin: string,
        goal: bigint,
        blockTime: bigint
    ): Promise<Address | undefined> {
        await this._provider.sunc()
        const deployer = this._provider.open(Deployer.createFromAddress(Address.parse(addressDeployer)))

        try {
            await deployer.sendDeployFundraiser(
                this._provider.sender(),
                toNano('0.05'),
                123n,
                goal,
                blockTime,
                ipfs,
                Address.parse(priorityCoin)
            )

            return deployer.address
        } catch (error) {
            console.error('deployFundraiser', error)
            return undefined
        }
    }

    public async sendClaim (addressFundraiser: string, tokens: Address[]): Promise<true | undefined> {
        await this._provider.sunc() // обязательно перед каждой функией

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser)) // создаем класс контракта

        const fundraiser = this._provider.open(fundraiserContract) // открываем контракт для работы с ним

        try {
            await fundraiser.sendClaim(this._provider.sender(), toNano('0.4'), 123n, tokens) // отправляем нужный запрос

            return true
        } catch (error) {
            console.error('sendClaim', error)
            return undefined
        }
    }

    public async getActive (addressFundraiser: string): Promise<boolean | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser))

        const fundraiser = this._provider.open(fundraiserContract)
        try {
            const result = await fundraiser.getActive()

            return result
        } catch (error) {
            console.error('getActive', error)
            return undefined
        }
    }

    public async getType (addressFundraiser: string): Promise<number | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const type = await fundraiser.getType()

            return type
        } catch (error) {
            console.error('getType', error)
            return undefined
        }
    }

    public async getBlockTime (addressFundraiser: string): Promise<number | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const blockTime = await fundraiser.getBlockTime()

            return blockTime
        } catch (error) {
            console.error('getBlockTime', error)
            return undefined
        }
    }

    public async getTotal (addressFundraiser: string): Promise<Dictionary<Address, bigint> | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(addressFundraiser))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const total = await fundraiser.getTotal()

            return total
        } catch (error) {
            console.error('getTotal', error)
            return undefined
        }
    }

    public async getHelperAddress (user: Address): Promise<Address | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(String(user)))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const total = await fundraiser.getHelperAddress(user)

            return total
        } catch (error) {
            console.error('getHelperAddress', error)
            return undefined
        }
    }

    public async getTotalHelper (addressFundraiser: string): Promise<Dictionary<Address, bigint> | undefined> {
        await this._provider.sunc()

        const helperContract = new HelperClass(Address.parse(addressFundraiser))

        const helper = this._provider.open(helperContract)

        try {
            const total = await helper.getTotal()

            return total
        } catch (error) {
            console.error('getHelperAddress', error)
            return undefined
        }
    }

    public async getPriorityCoin (address: string): Promise<Address | number | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(address))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const priorityCoin = await fundraiser.getPriorityCoin()

            return priorityCoin
        } catch (error) {
            console.error('getPriorityCoin', error)
            return undefined
        }
    }

    public async getNftData (address: string): Promise<Cell | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(address))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const nftData = await fundraiser.getContent()
            // console.log('nftData', nftData)

            return nftData
        } catch (error) {
            console.error('getNftData', error)
            return undefined
        }
    }

    public async getGoal (address: string): Promise<bigint | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(address))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const nftData = await fundraiser.getGoal()
            // console.log('nftData', nftData)

            return nftData
        } catch (error) {
            console.error('getGoal', error)
            return undefined
        }
    }

    public async getInfo (address: string): Promise<[bigint, bigint, bigint, Cell | null, bigint] | undefined> {
        await this._provider.sunc()

        const fundraiserContract = new FundraiserClass(Address.parse(address))

        const fundraiser = this._provider.open(fundraiserContract)

        try {
            const nftData = await fundraiser.getInfo()
            console.log('getInfo', nftData)

            return nftData
        } catch (error) {
            console.error('getInfo', error)
            return undefined
        }
    }

    public async getJsonNft (address: string): Promise<{ name: string, image: string, description: string } | undefined> {
        const data = await this.getNftData(address)

        let metadata

        if (data) {
            // const content = data.readBuffer()
            const boc = BOC.fromStandard(data.toBoc())
            const sliceCell = Slice.parse(boc)

            // console.log('content', BOC.fromStandard(data.toBoc()))
            const prefix = sliceCell.loadUint(8)
            if (prefix === 0x01) {
                const size = sliceCell.bits.length
                // console.log('sliceCell', sliceCell)

                const stringCell = sliceCell.loadBytes(size)

                const urlIpfs = (new TextDecoder('utf-8').decode(stringCell)).replace(
                    'ipfs://',
                    'https://cloudflare-ipfs.com/ipfs/'
                )

                metadata = await axios.get(urlIpfs)
                // console.log(metadata)

                return metadata.data as { name: string, image: string, description: string }
            }
        }
    }

    public async getTotalTon (address: string) {
        // this._provider.provider.call()

        const Trans = await this._provider.api().getAccountTransactions(Address.parse(address), 0n, Buffer.from(''))
        console.log(Trans)
    }

    public async getWalletAddressOf (address: string, addressToken: string): Promise<Address | undefined> {
        await this._provider.sunc()

        const JettonMinterContract = new JettonMinter(Address.parse(addressToken))

        const jettonMinter = this._provider.open(JettonMinterContract)

        try {
            const walletAddress = await jettonMinter.getWalletAddressOf(Address.parse(address))

            return walletAddress
        } catch (error) {
            console.log('getWalletAddressOf', error)
            return undefined
        }
    }

    public async sendTransfer (
        address: string,
        recipient: Address,
        amount: bigint
    ): Promise<true | undefined> {
        await this._provider.sunc()

        const JettonWalletContract = new JettonWalletClass(Address.parse(address))

        const jettonWallet = this._provider.open(JettonWalletContract)

        try {
            await jettonWallet.sendTransfer(
                this._provider.sender(),
                toNano('0.1'),
                toNano('0.08'),
                recipient,
                amount,
                beginCell().storeUint(0, 32).endCell()
            )

            return true
        } catch (error) {
            console.log('sendTransfer', error)
            return undefined
        }
    }

    public async getJettonBalance (address: string): Promise<bigint | undefined> {
        await this._provider.sunc()

        const JettonWalletContract = new JettonWalletClass(Address.parse(address))

        const jettonWallet = this._provider.open(JettonWalletContract)

        try {
            const jettonBalance = await jettonWallet.getJettonBalance()

            return jettonBalance
        } catch (error) {
            console.log('getJettonBalance', error)
            return undefined
        }
    }

    public async sendReturn (address: string): Promise<boolean | undefined> {
        await this._provider.sunc() // обязательно перед каждой функией

        const helperContract = new HelperClass(Address.parse(address)) // создаем класс контракта

        const helper = this._provider.open(helperContract) // открываем контракт для работы с ним

        try {
            await helper.sendReturn(this._provider.sender(), toNano('0.5'), 123n) // отправляем нужный запрос

            return true
        } catch (error) {
            console.error('sendReturn', error)
            return undefined
        }
    }
}
