/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import { FC, useEffect, useState } from 'react'
import { v1 } from 'uuid'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Title, Text } from '@delab-team/de-ui'

import { Link } from 'react-router-dom'
import { FundCard } from '../../components/fund-card'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { smlAddr } from '../../utils/smlAddr'

import { fixAmount } from '../../utils/fixAmount'

import { Items, TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import { FundCardSkeleton } from '../../components/fund-card-skeleton'

import IMG1 from '../../assets/img/01.png'
import TON from '../../assets/icons/ton.svg'

import s from './profile.module.scss'

interface ProfileProps {
    balance: string | undefined;
}

export const Profile: FC<ProfileProps> = ({ balance }) => {
    const [ first, setFirst ] = useState<boolean>(false)

    const [ loading, setLoading ] = useState<boolean>(false)

    // Funds
    const [ funds, setFunds ] = useState<FundType[]>([])

    const rawAddress = useTonAddress()

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    useEffect(() => {
        if (!first) {
            setFirst(true)
            setLoading(true)

            const api = new TonApi('testnet')

            const smart = new Smart(tonConnectUI, true)

            api.searchItemsFromUser(
                rawAddress
            ).then(async (items: Items | undefined) => {
                console.log('api.getItems', items)
                if (items) {
                    for (let i = 0; i < items.nft_items.length; i++) {
                        const addressFund = items.nft_items[i].address
                        const total = await smart.getTotal(addressFund)
                        const type = await smart.getType(addressFund)

                        console.log('total', total)
                        console.log('type', type)

                        const fund = {
                            title: items.nft_items[i].metadata.name ?? 'Not name',
                            img:
                                items.nft_items[i].metadata.image?.replace(
                                    'ipfs://',
                                    'https://cloudflare-ipfs.com/ipfs/'
                                ) ?? IMG1,
                            amount: 1,
                            target: 1,
                            asset: 'TON',
                            addressFund,
                            ownerAddress: items.nft_items[i].owner?.address
                        }

                        setFunds(prevFunds => [ ...prevFunds, fund ])
                    }
                }
            })
        }

        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])

    return (
        <div className={s.profile}>
            <div className={s.profileInfo}>
                <Title variant="h1" className={s.profileInfoTitle} color="#fff">
                    Your wallet adress:
                </Title>
                <Text className={s.profileInfoAddress} fontWeight="bold">
                    {smlAddr(rawAddress)}
                </Text>
                <Text className={s.profileInfoBalance}>
                    {fixAmount(balance || 0)}
                    <img src={TON} alt="icon" />
                </Text>
            </div>
            <Title variant="h2" className={s.title} color="#fff">
                My fundraiser
            </Title>
            <div className={s.cards}>
                {loading
                    ? Array(3)
                        .fill(null)
                        .map(_ => <FundCardSkeleton key={v1()} />)
                    : funds.map(el => (
                        <Link to={`/fundraiser-detail/${el.addressFund}`} key={v1()}>
                            <FundCard formatNumberWithCommas={formatNumberWithCommas} {...el} />
                        </Link>
                    ))}
            </div>
        </div>
    )
}
