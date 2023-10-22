/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import { FC, useEffect, useState } from 'react'
import { v1 } from 'uuid'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Title, Text, Button } from '@delab-team/de-ui'

import { Address } from 'ton-core'
import { FundCard } from '../../components/fund-card'
import { FundDetailSkeleton } from '../../components/fund-detail-skeleton'
import { NotFound } from '../../components/not-found'
import { AlertModal } from '../../components/alert-modal'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'
import { smlAddr } from '../../utils/smlAddr'
import { fixAmount } from '../../utils/fixAmount'

import { TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'
import { loadFund } from '../../logic/loadFund'

import { FundType } from '../../@types/fund'

import TON from '../../assets/icons/ton.svg'

import s from './profile.module.scss'

interface ProfileProps {
    addressCollection: string[];
    balance: string | undefined;
    isTestnet: boolean;
    createdFund: boolean;
    setCreatedFund: (el: boolean) => void;
    isTg: boolean;
}

const buttonTg = { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }

export const Profile: FC<ProfileProps> = ({ balance, addressCollection, isTestnet, createdFund, setCreatedFund, isTg }) => {
    const [ first, setFirst ] = useState<boolean>(false)

    const [ loading, setLoading ] = useState<boolean>(false)

    const [ offset, setOffset ] = useState<number>(0)

    // Funds
    const [ loadedFunds, setLoadedFunds ] = useState<FundType[]>([])

    const [ allItemsLoaded, setAllItemsLoaded ] = useState<boolean>(false)

    const rawAddress = useTonAddress(false)
    const rawAddressProfile = useTonAddress(true)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

    const loadMoreItems = async () => {
        if (allItemsLoaded || !rawAddress) {
            return
        }
        setLoading(true)

        const coll = addressCollection[isTestnet ? 1 : 0]
        const collAddr = Address.parse(coll).toRawString()
        const smart = new Smart(tonConnectUI, true)

        const limit = 5

        api.getProfileItemsV2(rawAddress, collAddr, limit, offset).then(async (items) => {
            if (items) {
                const newFunds: FundType[] = []

                for (let i = 0; i < items.length; i++) {
                    const addressFund = items[i].address
                    const fund = await loadFund(addressFund, smart, isTestnet, items[i].owner?.address ?? '',  { daysPassed: true,  daysTarget: true, description: true })

                    newFunds.push(fund as FundType)
                }

                setLoadedFunds(prevFunds => [ ...prevFunds, ...newFunds ])
                setOffset(offset + newFunds.length)

                if (items.length < 5) {
                    setAllItemsLoaded(true)
                }
            }
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(
        () => {
            if (!first || rawAddress) {
                setFirst(true)
                loadMoreItems()
            }
        },
        [ rawAddress ]
    )

    return (
        <div className={s.profile}>
            {createdFund && (
                <AlertModal isOpen={createdFund} onClose={() => setCreatedFund(false)} content={<>The fund has been successfully created!</>} />
            )}
            <div className={s.profileInfo}>
                <Title variant="h1" className={s.profileInfoTitle} color="#fff">
                    Your wallet adress:
                </Title>
                <Text className={s.profileInfoAddress} fontWeight="bold">
                    {smlAddr(rawAddressProfile)}
                </Text>
                <Text className={s.profileInfoBalance}>
                    {fixAmount(balance || 0)}
                    <img src={TON} alt="icon" />
                </Text>
            </div>
            <Title variant="h2" className={s.title} color="#fff" tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                My fundraiser
            </Title>
            <div className={s.cards}>
                <>
                    {loading
                        ? Array(3)
                            .fill(null)
                            .map(_ => <FundDetailSkeleton widthFull key={v1()} isTg={isTg} />)
                        : loadedFunds.map(el => (
                            <FundCard key={v1()} formatNumberWithCommas={formatNumberWithCommas} isLink {...el} />
                        ))}
                    {loadedFunds.length >= 5 && (
                        <Button
                            rounded="l"
                            size="stretched"
                            className="action-btn"
                            disabled={loading || allItemsLoaded}
                            onClick={loadMoreItems}
                            tgStyles={buttonTg}
                        >
                            Load more
                        </Button>
                    )}
                </>
                {loadedFunds.length === 0 && !loading && <NotFound text="Nothing found" />}
            </div>
        </div>
    )
}
