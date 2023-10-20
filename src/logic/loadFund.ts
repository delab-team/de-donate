import { Smart } from './smart'
import { jettons } from '../constants/jettons'
import { FundDetailType, FundType } from '../@types/fund'

export async function loadFund (
    address: string,
    smart: Smart,
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
        smart.getInfo(address)
    ])

    const [ metadata, info ] = await promise
    // const d = await smart.getTotalTon(addressFund)

    console.log('info', info)

    const nowTime = Math.floor(Date.now() / 1000)

    if (info) {
        let asset: string = 'WTON'
        try {
            const addr = info[3].beginParse().loadAddress()
            asset = jettons.filter(j => j.address === addr.toString())[0].label
        } catch (e) {
            console.log(e)
        }

        const AmountToken = info[3].beginParse().loadAddress()
        console.log(AmountToken)

        const fund: Partial<FundType & FundDetailType> = {
            title: metadata?.name ?? 'Not name',
            img: metadata?.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
            amount: 0,
            target: Number(info[4] / 10n ** 9n),
            asset,
            addressFund: address,
            ownerAddress,
            type: Number(info[1])
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
