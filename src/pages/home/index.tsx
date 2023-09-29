/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-unresolved */
import { FC, useState } from 'react'
import { v1 } from 'uuid'

import { Input, Title } from '@delab-team/de-ui'

import { FundCard } from '../../components/fund-card'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import IMG1 from '../../assets/img/01.png'
import IMG2 from '../../assets/img/02.png'

import s from './home.module.scss'

interface HomePageProps {}

const fundArray = [
    {
        img: IMG1,
        title: 'Tonstarter - xRocket',
        amount: 310,
        target: 1000
    },
    {
        img: IMG2,
        title: 'Tonstarter Early Birds',
        amount: 1283,
        target: 5000
    }
]

export const HomePage: FC<HomePageProps> = () => {
    const [ value, setValue ] = useState<string>('')

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

    return (
        <div className={s.home}>
            <Input
                placeholder="Search"
                value={value}
                onChange={onChange}
                variant="black"
                className={s.search}
            />
            <div className={s.filterBlock}>
                <Title variant="h1" customClassName={s.title}>
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
