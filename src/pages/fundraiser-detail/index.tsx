/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@delab-team/de-ui'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'

import { FundCard } from '../../components/fund-card'
import { Amount } from '../../components/amount'
import { FundDetailSkeleton } from '../../components/fund-detail-skeleton'

import { jettons } from '../../constants/jettons'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { ROUTES } from '../../utils/router'

import { Items, TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import s from './fundraiser-detail.module.scss'

import IMG1 from '../../assets/img/01.png'

interface FundraiserDetailProps {
    addressProfile: string | undefined
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

export const FundraiserDetail: FC<FundraiserDetailProps> = ({ addressProfile }) => {
    const { id } = useParams()
    const [ first, setFirst ] = useState<boolean>(false)

    const navigate = useNavigate()

    const rawAddress = useTonAddress()

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
        token: 'TOH'
    })

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const handleSelect = (value: string) => {
        setSelectedValue(value)
        setData({
            ...data,
            token: value
        })
    }

    const isOwnFund = addressProfile === fundData.ownerAddress

    useEffect(() => {
        if (!first) {
            if (!id) {
                return
            }
            setFirst(true)
            setLoading(true)

            const coll = 'kQCCcr1oWJ5XcMTgPn2HsAFIpvb_3C1YATFI6wrB57nEWgkb'

            const api = new TonApi('testnet')

            const smart = new Smart(tonConnectUI, true)

            api.getItemsV2(coll).then(async (items: Items | undefined) => {
                if (items) {
                    for (let i = 0; i < items.nft_items.length; i++) {
                        const addressFund = id

                        if (addressFund === undefined) {
                            return
                        }

                        if (addressFund === items.nft_items[i].address) {
                            const total = await smart.getTotal(addressFund)
                            const type = await smart.getType(addressFund)
                            const daysTarget = await smart.getBlockTime(addressFund)

                            console.log('total', total)
                            console.log('type', type)

                            const fund = {
                                title: items.nft_items[i].metadata.name ?? 'Not name',
                                img: items.nft_items[i].metadata.image?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
                                amount: 1,
                                target: 1,
                                asset: 'TON',
                                addressFund,
                                description: items.nft_items[i].metadata.description,
                                daysTarget: 1,
                                daysPassed: 1,
                                ownerAddress: items.nft_items[i].owner?.address
                            }

                            setFundData(fund)
                        }
                    }
                }
            })
        }

        setTimeout(() => {
            setLoading(false)
        }, 1500)

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
                <Button rounded="l" size="stretched" className="action-btn" disabled={data.amount.length < 1}>
                    Donate Now
                </Button>
            </div>

            {isOwnFund && (
                <Button className={s.editButton} onClick={() => navigate(ROUTES.FUNDRAISER_UPDATE)}>
                    Edit
                </Button>
            )}
        </div>
    )
}
