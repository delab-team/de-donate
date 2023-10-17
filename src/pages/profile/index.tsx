/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import { FC, useEffect, useState } from 'react'
import { v1 } from 'uuid'
import { Link } from 'react-router-dom'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Title, Text, Button } from '@delab-team/de-ui'

import { FundCard } from '../../components/fund-card'
import { FundCardSkeleton } from '../../components/fund-card-skeleton'
import { NotFound } from '../../components/not-found'
import { AlertModal } from '../../components/alert-modal'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'
import { smlAddr } from '../../utils/smlAddr'
import { fixAmount } from '../../utils/fixAmount'

import { TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import IMG1 from '../../assets/img/01.png'
import TON from '../../assets/icons/ton.svg'

import s from './profile.module.scss'
import { loadFund } from '../../logic/loadFund'

interface ProfileProps {
    addressCollection: string[];
    balance: string | undefined;
    isTestnet: boolean;
    createdFund: boolean;
    setCreatedFund: (el: boolean) => void
}

export const Profile: FC<ProfileProps> = ({ balance, addressCollection, isTestnet, createdFund, setCreatedFund }) => {
    const [ first, setFirst ] = useState<boolean>(false)

    const [ loading, setLoading ] = useState<boolean>(false)

    const [ offset, setOffset ] = useState<number>(0)

    // Funds
    const [ loadedFunds, setLoadedFunds ] = useState<FundType[]>([])

    const [ allItemsLoaded, setAllItemsLoaded ] = useState<boolean>(false)

    const rawAddress = useTonAddress(false)
    const rawAddressProfile = useTonAddress(true)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

    const loadMoreItems = async () => {
        if (allItemsLoaded) {
            return
        }
        setLoading(true)

        const coll = addressCollection[isTestnet ? 1 : 0]
        const smart = new Smart(tonConnectUI, true)

        api.searchItemsFromUser(rawAddress, 10, offset).then(async (items) => {
            if (items) {
                const newFunds: FundType[] = []
                for (let i = 0; i < items?.nft_items.length; i++) {
                    const addressFund = items.nft_items[i].address
                    // const fund = await loadFund(addressFund, smart, items.nft_items[i].owner?.address)
                    const total = await smart.getTotal(addressFund)
                    const type = await smart.getType(addressFund)

                    console.log('total', total)
                    console.log('type', type)

                    const fund = {
                        title: items.nft_items[i].metadata.name ?? 'Not name',
                        img: items.nft_items[i].metadata.image?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? IMG1,
                        amount: 1,
                        target: 1,
                        asset: 'TON',
                        addressFund,
                        ownerAddress: items.nft_items[i].owner?.address
                    }

                    newFunds.push(fund as FundType)
                }
                // const profileFunds = newFunds.filter(fund => fund.ownerAddress === rawAddress)

                setLoadedFunds(prevFunds => [ ...prevFunds, ...newFunds ])
                setOffset(offset + newFunds.length)

                if (items.nft_items.length < 10) {
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
            <Title variant="h2" className={s.title} color="#fff" tgStyles={{ color: '#000' }}>
                My fundraiser
            </Title>
            <div className={s.cards}>
                <>
                    {loading
                        ? Array(3)
                            .fill(null)
                            .map(_ => <FundCardSkeleton key={v1()} />)
                        : loadedFunds.map(el => (
                            <Link to={`/fundraiser-detail/${el.addressFund}`} key={v1()}>
                                <FundCard formatNumberWithCommas={formatNumberWithCommas} {...el} />
                            </Link>
                        ))}
                    {loadedFunds.length >= 10 && (
                        <Button
                            rounded="l"
                            size="stretched"
                            className="action-btn"
                            disabled={loading || allItemsLoaded}
                            onClick={loadMoreItems}
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
