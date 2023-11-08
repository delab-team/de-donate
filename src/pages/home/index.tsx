/* eslint-disable no-nested-ternary */
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

import { FundDetailType, FundType } from '../../@types/fund'

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
    const [ loadedFunds2, setLoadedFunds2 ] = useState<FundType[]>([])
    const [ allItemsLoaded, setAllItemsLoaded ] = useState<boolean>(false)
    const [ offset, setOffset ] = useState<number>(0)
    const [ offset2, setOffset2 ] = useState<number>(0)

    const debouncedSearchQuery = useDebounce(loadedFunds, 500)

    const [ loading, setLoading ] = useState<boolean>(true)

    const [ typeLoad, setTypeLoad ] = useState<boolean>(true)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

    const loadMoreItems = async (type: boolean = true) => {
        if (allItemsLoaded) {
            return
        }
        setLoading(true)

        const coll = addressCollection[isTestnet ? 1 : 0]

        const smart = new Smart(tonConnectUI, isTestnet)

        const arrItemsPromise: Promise<Partial<FundType & FundDetailType> | undefined>[] = []

        api.getItemsV2(coll, 10, offset).then(async (items: Items | undefined) => {
            if (items) {
                const newFunds: FundType[] = []

                for (let i = 0; i < items.nft_items.length; i++) {
                    const addressFund = items.nft_items[i].address

                    arrItemsPromise.push(loadFund(addressFund, smart, isTestnet, items.nft_items[i].owner?.address[Number(isTestnet)], {}))
                }
            }
        }).finally(async () => {
            const arrItems = await Promise.all(arrItemsPromise)

            console.log('ok')

            const newFunds: FundType[] = []
            for (let i = 0; i < arrItems.length; i++) {
                const fund = arrItems[i]

                newFunds.push(fund as FundType)

                if (fund && type && fund.verificated && fund.amount && fund.amount > 0.001) {
                    const local: FundType[] = [ fund as FundType ]

                    if (type) {
                        setLoadedFunds(prevFunds => [ ...prevFunds, ...local ])
                    }
                }
            }

            setLoadedFunds2(prevFunds => [ ...prevFunds, ...newFunds ])

            console.log('ok')

            // setLoadedFunds(prevFunds => [ ...prevFunds, ...newFunds ])
            setOffset(offset + newFunds.length)

            if (arrItems.length < 10) {
                setAllItemsLoaded(true)
            }

            setLoading(false)
        })
    }

    useEffect(() => {
        loadMoreItems()
        if (!first) {
            setFirst(true)
        }
    }, [])

    function changeType2 (type: boolean) {
        setTypeLoad(type)
        // setOffset(0)
        // setLoadedFunds([])

        // setAllItemsLoaded(false)

        // loadMoreItems(type)
        console.log('type')
    }

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
                <IconSelector id="search" color="#98989E" className={s.searchIcon} size="20" tgStyles={{ stroke: 'var(--tg-theme-link-color)' }} />
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
                        <IconSelector id="x" size='20' color="#fff" tgStyles={{ stroke: 'var(--tg-theme-link-color)' }} />
                    </button>
                )
                }
            </div>
            <div className={s.homeBlock}>
                <Title variant="h1" className={s.title} color="#fff" tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                    <span style={{ opacity: typeLoad ? 1 : 0.5, cursor: 'pointer', color: isTg ? 'var(--tg-theme-text-color)' : '#fff' }} onClick={() => changeType2(true)}>Top fundraiser </span>
                    <span style={{ opacity: !typeLoad ? 1 : 0.5, cursor: 'pointer', color: isTg ? 'var(--tg-theme-text-color)' : '#fff' }} onClick={() => changeType2(false)}>All fundraiser</span>
                </Title>

                <div className={s.cards}>
                    <>
                        {loading
                            ? Array(3)
                                .fill(null)
                                .map(_ => <FundCardSkeleton key={v1()} isTg={isTg} />)
                            : (typeLoad === true ? loadedFunds.filter(f => f !== undefined).map(el => (
                                <FundCard
                                    key={v1()}
                                    isLink
                                    formatNumberWithCommas={formatNumberWithCommas}
                                    {...el}
                                />
                            )) : null)}

                        {loading
                            ? Array(3)
                                .fill(null)
                                .map(_ => <FundCardSkeleton key={v1()} isTg={isTg} />)
                            : (typeLoad === false ? loadedFunds2.filter(f => f !== undefined).map(el => (
                                <FundCard
                                    key={v1()}
                                    isLink
                                    formatNumberWithCommas={formatNumberWithCommas}
                                    {...el}
                                />
                            )) : null
                            )}
                        {
                            loadedFunds2.length >= 10 && (
                                <Button
                                    rounded="l"
                                    size="stretched"
                                    className="action-btn"
                                    disabled={loading || allItemsLoaded}
                                    onClick={() => loadMoreItems(true)}
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
