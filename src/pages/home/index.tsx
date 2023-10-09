/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-unresolved */
import { FC, useEffect, useState } from 'react'
import { v1 } from 'uuid'

import { IconSelector, Input, Title } from '@delab-team/de-ui'

import { FundCard } from '../../components/fund-card'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import IMG1 from '../../assets/img/01.png'
import IMG2 from '../../assets/img/02.png'

import s from './home.module.scss'
import { Items, TonApi } from '../../logic/tonapi'

interface HomePageProps {}

interface Fund {
    img: string,
    title: string,
    amount: number,
    target: number,
    asset: string
}

const fundArray: Fund[] = [
    {
        img: IMG1,
        title: 'Tonstarter - xRocket',
        amount: 310,
        target: 1000,
        asset: 'TON'
    },
    {
        img: IMG2,
        title: 'Tonstarter Early Birds',
        amount: 1283,
        target: 5000,
        asset: 'TON'
    }
]

export const HomePage: FC<HomePageProps> = () => {
    const [ value, setValue ] = useState<string>('')
    const [ first, setFirst ] = useState<boolean>(false)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

    useEffect(() => {
        if (!first) {
            setFirst(true)

            const coll = 'kQBH_ElENh-if6t_j7Mr_NTPAzPnWJXOhJrXhumQhC__xxKu'

            const api = new TonApi()

            api.getItems(coll).then((items: Items | undefined) => {
                console.log('api.getItems', items)
                if (items) {
                    for (let i = 0; i < items.nft_items.length; i++) {
                        fundArray.push({
                            title: '1',
                            img: '1',
                            amount: 1,
                            target: 1,
                            asset: 'TON'
                        })
                    }
                }
            })
        }
    }, [ ])

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
                <Title variant="h1" className={s.title} color='#fff'>
                    Top fundraiser
                </Title>
                <div className={s.cards}>
                    {fundArray.map(el => (
                        <FundCard
                            key={v1()}
                            formatNumberWithCommas={formatNumberWithCommas}
                            {...el}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
