/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-unresolved */
import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { v1 } from 'uuid'

import { IconSelector, Input, Title } from '@delab-team/de-ui'
import { useTonConnectUI } from '@tonconnect/ui-react'

import { FundCard } from '../../components/fund-card'
import { FundCardSkeleton } from '../../components/fund-card-skeleton'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { Items, TonApi } from '../../logic/tonapi'

import { Smart } from '../../logic/smart'

import { FundType } from '../../@types/fund'

import useDebounce from '../../hooks/useDebounce'

import IMG1 from '../../assets/img/01.png'

import s from './home.module.scss'

interface HomePageProps {}

export const HomePage: FC<HomePageProps> = () => {
    const [ first, setFirst ] = useState<boolean>(false)

    // Not found
    const [ showNotFound, setShowNotFound ] = useState<boolean>(false)

    // Search
    const [ value, setValue ] = useState<string>('')
    const debouncedSearchQuery = useDebounce(value, 500)

    // Funds
    const [ funds, setFunds ] = useState<FundType[]>([])
    const [ originalFunds, setOriginalFunds ] = useState<FundType[]>([])

    console.log('🚀 ~ file: index.tsx:33 ~ funds:', funds)

    const [ loading, setLoading ] = useState<boolean>(true)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const api = new TonApi('testnet')

    useEffect(() => {
        if (!first) {
            setFirst(true)
            setLoading(true)

            const coll = 'kQCCcr1oWJ5XcMTgPn2HsAFIpvb_3C1YATFI6wrB57nEWgkb'

            const smart = new Smart(tonConnectUI, true)

            api.getItemsV2(coll).then(async (items: Items | undefined) => {
                console.log('api.getItems', items)
                if (items) {
                    const newFunds = []

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

                        newFunds.push(fund)

                        setOriginalFunds(prevFunds => [ ...prevFunds, fund ])
                        setFunds(newFunds)
                    }
                }
            })
        }

        setTimeout(() => {
            setLoading(false)
        }, 1500)
    }, [])

    // Search

    const filterFunds = (searchQuery: string) => {
        if (searchQuery === '') {
            return originalFunds
        }
        return originalFunds.filter(fund => fund.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            const filteredFunds = filterFunds(value)
            setFunds(filteredFunds)
            setShowNotFound(filteredFunds.length === 0)
            setLoading(false)
        }, 1000)
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
            </div>
            <div className={s.filterBlock}>
                <Title variant="h1" className={s.title} color="#fff">
                    Top fundraiser
                </Title>
                <div className={s.cards}>
                    <>
                        {loading
                            ? Array(3)
                                .fill(null)
                                .map(_ => <FundCardSkeleton key={v1()} />)
                            : funds.map(el => (
                                <Link to={`/fundraiser-detail/${el.addressFund}`} key={v1()}>
                                    <FundCard
                                        formatNumberWithCommas={formatNumberWithCommas}
                                        {...el}
                                    />
                                </Link>
                            ))}
                        {debouncedSearchQuery && funds.length === 0 && showNotFound && (
                            <div className={s.notFound}>
                                <Title variant="h4">Nothing not found</Title>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </div>
    )
}
