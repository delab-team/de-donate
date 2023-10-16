/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-useless-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-unresolved */
import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { v1 } from 'uuid'

import { Button, IconSelector, Input, Title } from '@delab-team/de-ui'
import { useTonConnectUI } from '@tonconnect/ui-react'

import { FundCard } from '../../components/fund-card'
import { FundCardSkeleton } from '../../components/fund-card-skeleton'
import { NotFound } from '../../components/not-found'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { Items, TonApi } from '../../logic/tonapi'

import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import useDebounce from '../../hooks/useDebounce'

import IMG1 from '../../assets/img/01.png'

import s from './home.module.scss'

interface HomePageProps {
    addressCollection: string[],
    isTestnet: boolean
}

export const HomePage: FC<HomePageProps> = ({ addressCollection, isTestnet }) => {
    const [ first, setFirst ] = useState<boolean>(false)

    // Not found
    const [ showNotFound, setShowNotFound ] = useState<boolean>(false)

    // Search
    const [ value, setValue ] = useState<string>('')
    const debouncedSearchQuery = useDebounce(value, 500)

    // Funds
    // const [ originalFunds, setOriginalFunds ] = useState<FundType[]>([])
    const [ loadedFunds, setLoadedFunds ] = useState<FundType[]>([])
    const [ allItemsLoaded, setAllItemsLoaded ] = useState<boolean>(false)
    const [ offset, setOffset ] = useState<number>(0)

    const [ loading, setLoading ] = useState<boolean>(true)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

    const loadMoreItems = async () => {
        if (allItemsLoaded) {
            return
        }
        setLoading(true)

        const coll = addressCollection[isTestnet ? 1 : 0]

        const smart = new Smart(tonConnectUI, true)

        api.getItemsV2(coll, 10, offset).then(async (items: Items | undefined) => {
            console.log('api.getItems', items)
            if (items) {
                const newFunds: FundType[] = []

                for (let i = 0; i < items.nft_items.length; i++) {
                    const addressFund = items.nft_items[i].address

                    const promise = Promise.all([
                        smart.getTotal(addressFund),
                        smart.getType(addressFund),
                        smart.getPriorityCoin(addressFund),
                        smart.getJsonNft(addressFund)
                    ])

                    const [ total, type, token, metadata ] = await promise

                    console.log('total', total)

                    let infoToken
                    if (token) {
                        console.log('token', token)
                        infoToken = await api.getJettonInfo(token.toString())
                    }

                    console.log('total', total)
                    console.log('type', type)

                    const fund: FundType = {
                        title: items.nft_items[i].metadata.name ?? (metadata?.name ?? 'Not name'),
                        img:
                            items.nft_items[i].metadata.image?.replace(
                                'ipfs://',
                                'https://cloudflare-ipfs.com/ipfs/'
                            ) ?? (metadata?.image.replace(
                                'ipfs://',
                                'https://cloudflare-ipfs.com/ipfs/'
                            ) ??  IMG1),
                        amount: 1,
                        target: 1,
                        asset: token ? infoToken?.metadata.symbol ?? 'TON' : 'TON',
                        addressFund,
                        ownerAddress: items.nft_items[i].owner?.address
                    }

                    newFunds.push(fund)
                }
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

    useEffect(() => {
        loadMoreItems()
        if (!first) {
            setFirst(true)
        }
    }, [])

    // Search

    // const filterFunds = (searchQuery: string) => {
    //     if (searchQuery === '') {
    //         return originalFunds
    //     }
    //     return originalFunds.filter(fund => fund.title.toLowerCase().includes(searchQuery.toLowerCase()))
    // }

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            // const filteredFunds = filterFunds(value)
            // setFunds(filteredFunds)
            // setShowNotFound(filteredFunds.length === 0)
            // setLoading(false)
        }, 5000)
    }, [ debouncedSearchQuery ])

    // Not found

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowNotFound(true)
        }, 3000)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    return (
        <div className={s.home}>
            <div className={s.searchInner}>
                <IconSelector id="search" color="#98989E" className={s.searchIcon} size="20" />
                <Input
                    placeholder="Search"
                    value={value}
                    onChange={onChange}
                    variant="black"
                    className={`${s.search} ${s.searchHome}`}
                />
                {value.length >= 1 && (
                    <button className={s.searchClear} onClick={() => setValue('')}>
                        <IconSelector id="x" size='20' color="#fff" />
                    </button>
                )
                }
            </div>
            <div className={s.homeBlock}>
                <Title variant="h1" className={s.title} color="#fff">
                    Top fundraiser
                </Title>
                <div className={s.cards}>
                    <>
                        {loading
                            ? Array(3)
                                .fill(null)
                                .map(_ => <FundCardSkeleton key={v1()} />)
                            : loadedFunds.map(el => (
                                <Link to={`/fundraiser-detail/${el.addressFund}`} key={v1()}>
                                    <FundCard
                                        formatNumberWithCommas={formatNumberWithCommas}
                                        {...el}
                                    />
                                </Link>
                            ))}
                        <Button
                            rounded="l"
                            size="stretched"
                            className="action-btn"
                            disabled={loading || allItemsLoaded}
                            onClick={loadMoreItems}
                        >
                        Load more
                        </Button>
                        {debouncedSearchQuery && loadedFunds.length === 0 && showNotFound && (
                            <NotFound text="Nothing found" />
                        )}
                    </>
                </div>
            </div>
        </div>
    )
}
