/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@delab-team/de-ui'
import { SendTransactionRequest, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'

import { toNano } from 'ton-core'
import { FundCard } from '../../components/fund-card'
import { Amount } from '../../components/amount'
import { FundDetailSkeleton } from '../../components/fund-detail-skeleton'

import { jettons } from '../../constants/jettons'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { Item, Items, TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import s from './fundraiser-detail.module.scss'

import IMG1 from '../../assets/img/01.png'

interface FundraiserDetailProps {
    addressCollection: string[],
    isTestnet: boolean
}

type DataType = {
    amount: string;
    token: string;
}

type FundDetailType = {
    description: string | undefined;
    daysTarget: number;
    daysPassed: number;
}

export const FundraiserDetail: FC<FundraiserDetailProps> = ({ addressCollection, isTestnet }) => {
    const { id } = useParams()
    const [ first, setFirst ] = useState<boolean>(false)

    const navigate = useNavigate()

    const rawAddress = useTonAddress(false)

    const [ fundData, setFundData ] = useState<FundType & FundDetailType>({
        addressFund: '',
        amount: 0,
        img: '',
        asset: '',
        target: 0,
        title: '',
        description: '',
        daysTarget: 0,
        daysPassed: 0,
        ownerAddress: ''
    })

    const [ loading, setLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const [ data, setData ] = useState<DataType>({
        amount: '',
        token: 'TON'
    })

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const handleSelect = (value: string) => {
        setSelectedValue(value)
        setData({
            ...data,
            token: value
        })
    }

    const isOwnFund = rawAddress === fundData.ownerAddress

    async function donate () {
        // const smart = new Smart(tonConnectUI, true)

        if (id) {
            const tx: SendTransactionRequest = {
                validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                messages: [
                    {
                        address: id,
                        amount: toNano(data.amount).toString()
                    }
                ]
            }
            tonConnectUI.sendTransaction(tx)
        } else {
        }
    }

    useEffect(() => {
        if (!first) {
            if (!id) {
                return
            }
            setFirst(true)
            setLoading(true)

            const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

            const smart = new Smart(tonConnectUI, true)

            api.getItemV2(id).then(async (item: Item | undefined) => {
                if (item) {
                    const addressFund = id

                    if (addressFund === undefined) {
                        return
                    }

                    const promise = Promise.all([
                        smart.getTotal(addressFund),
                        smart.getType(addressFund),
                        smart.getPriorityCoin(addressFund),
                        smart.getJsonNft(addressFund),
                        smart.getBlockTime(addressFund)
                    ])

                    const [ total, type, token, metadata, daysTarget ] = await promise

                    // const d = await smart.getTotalTon(addressFund)

                    console.log('total', total)
                    console.log('type', type)

                    const nowTime = Math.floor(Date.now() / 1000)

                    const fund: FundType & FundDetailType = {
                        title: item.metadata.name ?? (metadata?.name ?? 'Not name'),
                        img: item.metadata.image?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? metadata?.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
                        amount: 1,
                        target: 1,
                        asset: 'TON',
                        addressFund,
                        description: item.metadata.description ?? metadata?.desciption,
                        daysTarget: daysTarget ? (Math.floor((daysTarget - nowTime) / 86400)) : 0,
                        daysPassed: 1,
                        ownerAddress: item.owner?.address
                    }

                    setFundData(fund)

                    setTimeout(() => {
                        setLoading(false)
                    }, 200)
                }
            })
        }

        return () => {
            setFundData({
                addressFund: '',
                amount: 0,
                img: '',
                asset: '',
                target: 0,
                title: '',
                description: '',
                daysTarget: 0,
                daysPassed: 0,
                ownerAddress: ''
            })
        }
    }, [ id ])

    return (
        <div className={s.inner}>
            {loading ? (
                <FundDetailSkeleton />
            ) : (
                <FundCard
                    title={fundData.title}
                    target={fundData.target}
                    img={fundData.img || IMG1}
                    amount={fundData.amount}
                    daysTarget={fundData.daysTarget}
                    daysPassed={fundData.daysPassed}
                    formatNumberWithCommas={formatNumberWithCommas}
                    description={fundData.description}
                />
            )}

            <div className={s.innerActions}>
                <div className={s.amountInner}>
                    <Amount
                        options={jettons}
                        value={String(data.amount)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setData({
                                ...data,
                                amount: e.target.value
                            })
                        }}
                        selectedValue={selectedValue}
                        handleSelect={handleSelect}
                    />
                </div>
                <Button
                    rounded="l"
                    size="stretched"
                    className="action-btn"
                    disabled={data.amount.length < 1}
                    onClick={() => donate()}
                >
                    Donate Now
                </Button>
            </div>

            {isOwnFund && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                        className={s.editButton}
                        onClick={() => navigate(`/fundraiser-update/${id}`)}
                        style={{ marginRight: '16px' }}
                    >
                    Edit
                    </Button>
                    <Button className={s.editButton} onClick={() => navigate(`/fundraiser-update/${id}`)}>
                    Withdrawal
                    </Button>
                </div>
            )}
        </div>
    )
}
