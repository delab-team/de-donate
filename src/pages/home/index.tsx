/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-useless-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-unresolved */
import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v1 } from 'uuid'
import { Address } from 'ton-core'

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

import s from './home.module.scss'
import { loadFund } from '../../logic/loadFund'
import { ROUTES } from '../../utils/router'

interface HomePageProps {
    addressCollection: string[],
    isTestnet: boolean,
    isTg: boolean
}

const inputTgStyles = { input: { background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' } }
const buttonTg = { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }

export const HomePage: FC<HomePageProps> = ({ addressCollection, isTestnet, isTg }) => {
    const navigate = useNavigate()

    const [ first, setFirst ] = useState<boolean>(false)

    // Not found
    const [ showNotFound, setShowNotFound ] = useState<boolean>(false)

    // Search
    const [ address, setAddress ] = useState<string>('')

    // Funds
    const [ loadedFunds, setLoadedFunds ] = useState<FundType[]>([])
    const [ allItemsLoaded, setAllItemsLoaded ] = useState<boolean>(false)
    const [ offset, setOffset ] = useState<number>(0)

    const debouncedSearchQuery = useDebounce(loadedFunds, 500)

    const [ loading, setLoading ] = useState<boolean>(true)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)

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
            if (items) {
                const newFunds: FundType[] = []

                for (let i = 0; i < items.nft_items.length; i++) {
                    const addressFund = items.nft_items[i].address

                    const fund = await loadFund(addressFund, smart, items.nft_items[i].owner?.address)
                    newFunds.push(fund as FundType)
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

    // Not found

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowNotFound(true)
        }, 3000)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    // Search

    useEffect(() => {
        if (address) {
            try {
                const addr = Address.parse(address)

                navigate(`/fundraiser-detail/${addr}`)
            } catch (err) {
                console.error(err)
            }
        }
    }, [ address ])

    return (
        <div className={s.home}>
            <div className={s.searchInner}>
                <IconSelector id="search" color="#98989E" className={s.searchIcon} size="20" />
                <Input
                    placeholder="Search by address fund"
                    value={address}
                    onChange={onChange}
                    variant="black"
                    className={`${s.search} ${s.searchHome}`}
                    tgStyles={inputTgStyles}
                />
                {address.length >= 1 && (
                    <button className={s.searchClear} onClick={() => setAddress('')}>
                        <IconSelector id="x" size='20' color="#fff" tgStyles={{ stroke: '#000' }} />
                    </button>
                )
                }
            </div>
            <div className={s.homeBlock}>
                <Title variant="h1" className={s.title} color="#fff" tgStyles={{ color: '#000' }}>
                    Top fundraiser
                </Title>
                <div className={s.cards}>
                    <>
                        {loading
                            ? Array(3)
                                .fill(null)
                                .map(_ => <FundCardSkeleton key={v1()} isTg={isTg} />)
                            : loadedFunds.map(el => (
                                <Link to={`/fundraiser-detail/${el.addressFund}`} key={v1()}>
                                    <FundCard
                                        formatNumberWithCommas={formatNumberWithCommas}
                                        {...el}
                                    />
                                </Link>
                            ))}
                        {
                            loadMoreItems.length >= 10 && (
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
                            )
                        }
                        {debouncedSearchQuery && loadedFunds.length === 0 && showNotFound && (
                            <NotFound text="Nothing found" />
                        )}
                    </>
                </div>
            </div>
        </div>
    )
}
