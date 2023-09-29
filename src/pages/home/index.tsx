/* eslint-disable import/no-unresolved */
import { FC, useState } from 'react'
import { Link } from 'react-router-dom'

import { Input } from '@delab-team/de-ui'

import { ROUTES } from '../../utils/router'

import s from './home.module.scss'

interface HomePageProps {}

export const HomePage: FC<HomePageProps> = () => {
    const [ value, setValue ] = useState<string>('')
    console.log('🚀 ~ file: index.tsx:9 ~ value:', value)

    return (
        <div className={s.home}>
            <Input placeholder='Search' value={value} onChange={setValue} />
            <div className={s.filterBlock}>
                <h2 className={s.filterTitle}>Filter</h2>
                <Link to={ROUTES.COLLECTING_DETAIL} className={s.card}>Card</Link>
                <Link to={ROUTES.COLLECTING_DETAIL} className={s.card}>Card</Link>
                <Link to={ROUTES.COLLECTING_DETAIL} className={s.card}>Card</Link>
                <Link to={ROUTES.COLLECTING_DETAIL} className={s.card}>Card</Link>
            </div>
        </div>
    )
}
