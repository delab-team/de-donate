import { Address, Dictionary, fromNano } from 'ton-core'
import { Smart } from './smart'
import { jettons } from '../constants/jettons'
import { FundDetailType, FundType } from '../@types/fund'

export async function loadFund (
    address: string,
    smart: Smart,
    isTestnet: boolean,
    ownerAddress?: string,
    excludeFields: {
        description?: boolean;
        daysTarget?: boolean;
        daysPassed?: boolean;
    } = {
        description: false,
        daysTarget: false,
        daysPassed: false
    }
): Promise<Partial<FundType & FundDetailType> | undefined> {
    const promise = Promise.all([
        smart.getJsonNft(address),
        smart.getInfo(address),
        smart.getPriorityCoin(address),
        smart.getTotal(address)
    ])

    const [ metadata, info, priority, total ] = await promise
    // const d = await smart.getTotalTon(addressFund)

    console.log('info', info)
    console.log('priority', priority?.toString())

    const nowTime = Math.floor(Date.now() / 1000)

    let asset: string = 'WTON'

    if (info && priority) {
        const addressWalletPriorityFund = await smart.getWalletAddressOf(address, priority.toString())

        let amountPriority = 0n

        if (total && priority && typeof priority !== 'number' && addressWalletPriorityFund) {
            const DictAmountTest = total
            const keys = DictAmountTest.keys()
            const values = DictAmountTest.values()

            amountPriority = DictAmountTest.get(addressWalletPriorityFund) ?? 0n

            // console.log('amountPriority', fromNano(amountPriority))
            // console.log('amountPriority', (amountPriority / 10n ** 9n))
            // console.log('keys', keys)
            // console.log('values', values)
            // console.log('size', DictAmountTest.size)

            try {
                const addr = priority
                asset = jettons.filter(j => Address.parse(j.address[Number(isTestnet)]).toString() === addr.toString())[0].label
            } catch (e) {
                console.log(e)
                return undefined
            }
        }

        const fund: Partial<FundType & FundDetailType> = {
            id: address,
            title: metadata?.name ?? 'Not name',
            img: metadata?.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
            amount: Number(fromNano(amountPriority)),
            target: Number(fromNano(info[4])),
            asset,
            addressFund: address,
            ownerAddress,
            type: Number(info[1]),
            verificated: Number(info[1]) === 0
        }

        if (excludeFields?.description) {
            fund.description = metadata?.description
        }

        if (excludeFields?.daysTarget) {
            fund.daysTarget = (Math.floor((Number(info[2]) - nowTime) / 86400))
        }

        if (excludeFields?.daysPassed) {
            fund.daysPassed = 1
        }

        return fund as FundType & FundDetailType
    }
    return undefined
}
