import { FC } from 'react'
import { v1 } from 'uuid'

import { useTonAddress } from '@tonconnect/ui-react'
import { Title, Text } from '@delab-team/de-ui'

import { FundCard } from '../../components/fund-card'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { smlAddr } from '../../utils/smlAddr'

import IMG1 from '../../assets/img/01.png'
import TON from '../../assets/icons/ton.svg'

import s from './profile.module.scss'

interface ProfileProps {
    balance: string | undefined;
}

const fundArray = [
    {
        img: IMG1,
        title: 'Tonstarter - xRocket',
        amount: 310,
        target: 1000
    }
]

export const Profile: FC<ProfileProps> = ({ balance }) => {
    const rawAddress = useTonAddress()

    return (
        <div className={s.profile}>
            <div className={s.profileInfo}>
                <Title variant="h1" className={s.profileInfoTitle} color='#fff'>Your wallet adress:</Title>
                <Text className={s.profileInfoAddress} fontWeight='bold'>{smlAddr(rawAddress)}</Text>
                <Text className={s.profileInfoBalance}>
                    {balance}
                    <img src={TON} alt="icon" />
                </Text>
            </div>
            <Title variant="h2" className={s.title} color='#fff'>
            My fundraiser
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
    )
}
