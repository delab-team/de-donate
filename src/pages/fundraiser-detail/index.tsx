/* eslint-disable max-len */
import { FC, useState } from 'react'

import { Button, Input, Select } from '@delab-team/de-ui'
import { FundCard } from '../../components/fund-card'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import s from './fundraiser-detail.module.scss'

import IMG1 from '../../assets/img/01.png'

interface FundraiserDetailProps {}

// const options = [
//     { value: 'TON', label: 'TON' },
//     { value: 'TON', label: 'TON' },
//     { value: 'TON', label: 'TON' }
// ]

export const FundraiserDetail: FC<FundraiserDetailProps> = () =>  {
    const [ amount, setAmount ] = useState<number>(0)

    // const [ selectedValue, setSelectedValue ] = useState<string>(options[0].value)

    // const handleSelect = (value: string) => {
    //     setSelectedValue(value)
    // }

    return (
        <div className={s.inner}>
            <FundCard
                title='Tonstarter - xRocket'
                target={1000}
                img={IMG1}
                amount={310}
                formatNumberWithCommas={formatNumberWithCommas}
                description='
            🚀 xRocket x Tonstarter | 🌠 Tokenfall of cosmic dimensions

            👏 We’re launching a campaign where participants will go on an adventure through the world of centralized multichain Telegram exchange xRocket!
            '
            />

            <div className={s.innerActions}>
                <div className={s.selectInner}>
                    <Input
                        type="number"
                        value={String(amount)}
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) => {
                                setAmount(Number(e.target.value))
                            }
                        }
                        variant="black"
                        className="input"
                        placeholder="Name"
                    />
                    {/* <Select
                        options={options}
                        selectedValue={selectedValue}
                        onSelect={handleSelect}
                        variant="black"
                        className={s.select}
                    /> */}
                </div>
                <Button rounded="l" size="stretched" className="action-btn">
                  Donate Now
                </Button>
            </div>
        </div>
    )
}
