/* eslint-disable max-len */
import { FC, useState } from 'react'

import { Button } from '@delab-team/de-ui'

import { FundCard } from '../../components/fund-card'
import { Amount } from '../../components/amount'
import { jettons } from '../../constants/jettons'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import s from './fundraiser-detail.module.scss'

import IMG1 from '../../assets/img/01.png'

interface FundraiserDetailProps {}

type DataType = {
    amount: string
    token: string
}

export const FundraiserDetail: FC<FundraiserDetailProps> = () =>  {
    const [ data, setData ] = useState<DataType>({
        amount: '',
        token: 'TOH'
    })

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const handleSelect = (value: string) => {
        setSelectedValue(value)
        setData({
            ...data,
            token: value
        })
    }

    return (
        <div className={s.inner}>
            <FundCard
                title='Tonstarter - xRocket'
                target={1000}
                img={IMG1}
                amount={310}
                daysTarget={15}
                daysPassed={7}
                formatNumberWithCommas={formatNumberWithCommas}
                description='🚀 xRocket x Tonstarter | 🌠 Tokenfall of cosmic dimensions
                    👏 We’re launching a campaign where participants will go on an adventure through the world of centralized multichain Telegram exchange xRocket!
                '
            />

            <div className={s.innerActions}>
                <div className={s.amountInner}>
                    <Amount
                        options={jettons}
                        value={String(data.amount)}
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) => {
                                setData({
                                    ...data,
                                    amount: e.target.value
                                })
                            }
                        }
                        selectedValue={selectedValue}
                        handleSelect={handleSelect}
                    />
                </div>
                <Button
                    rounded="l"
                    size="stretched"
                    className="action-btn"
                >
                  Donate Now
                </Button>
            </div>
        </div>
    )
}
