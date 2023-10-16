/* eslint-disable max-len */
import { FC } from 'react'
import { ProgressBar, Text } from '@delab-team/de-ui'

import { ExpandableText } from '../expandable-text'

import s from './fund-card.module.scss'

import TON from '../../assets/icons/ton.svg'
import TIME from '../../assets/icons/time.svg'

interface FundCardProps {
    img: string;
    title: string;
    amount: number;
    target: number;
    description?: string;
    daysTarget?: number;
    daysPassed?: number;
    fundType?: number;
    formatNumberWithCommas: (number: number) => string;
}

export const FundCard: FC<FundCardProps> = ({
    img,
    title,
    amount,
    target,
    daysTarget,
    daysPassed,
    description,
    fundType,
    formatNumberWithCommas
}) => {
    const progressValue = ((amount / target) * 100).toFixed(2)
    let progressValueDays = null
    if (daysTarget !== undefined && daysPassed !== undefined) {
        progressValueDays = ((daysPassed / daysTarget) * 100).toFixed(2)
    }

    return (
        <div className={s.card}>
            <div className={s.cardTop} style={{ backgroundImage: `url(${img})` }} />
            <div className={s.cardDetail}>
                <div className={s.title}>{title}</div>
                <ProgressBar
                    type="default"
                    size="large"
                    progress={Number(progressValue)}
                    color="blue"
                    className={s.progressBar}
                />
                <div className={s.cardInfo}>
                    <div className={s.cardTarget}>
                        <img src={TON} width="18" height="18" alt="ton icon" />
                        <Text fontSize="medium" fontWeight="bold">
                            {formatNumberWithCommas(amount)}
                            {' / '}
                            {formatNumberWithCommas(target)}
                        </Text>
                    </div>
                    <Text fontSize="medium" fontWeight="bold">
                        {progressValue + '%'}
                    </Text>
                </div>
                {daysTarget && daysPassed && fundType !== 1 && daysTarget > 0 ? (
                    <div className={`${s.cardInfo} ${s.cardDays}`}>
                        <div className={s.cardTarget}>
                            <img src={TIME} className={s.cardTime} width="18" height="18" alt="time icon" />
                            <Text fontSize="medium" fontWeight="bold">
                                {formatNumberWithCommas(daysPassed)}
                                {' / '}
                                {formatNumberWithCommas(daysTarget)} days
                            </Text>
                        </div>
                        <Text fontSize="medium" fontWeight="bold">
                            {progressValueDays + '%'}
                        </Text>
                    </div>
                ) : (<></>)}
                {description && (
                    <>
                        <ExpandableText text={description} />
                    </>
                )}
            </div>
        </div>
    )
}
