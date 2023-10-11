import { FC } from 'react'
import { ProgressBar, Text, Tooltip } from '@delab-team/de-ui'

import { ExpandableText } from '../expandable-text'

import s from './fund-card.module.scss'

import TON from '../../assets/icons/ton.svg'

interface FundCardProps {
    img: string;
    title: string;
    amount: number;
    target: number;
    description?: string;
    daysTarget?: number;
    daysPassed?: number;
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
    formatNumberWithCommas
}) => {
    const progressValue = ((amount / target) * 100).toFixed(2)
    let progressValueDays = null
    if (daysTarget !== undefined && daysPassed !== undefined) {
        progressValueDays = ((daysPassed / daysTarget) * 100).toFixed(2)
    }

    return (
        <div className={s.card}>
            <div className={s.cardTop}>
                <img src={img} alt="img" />
            </div>
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
                        <img src={TON} alt="ton icon" />
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
                {daysTarget && daysPassed && (
                    <div className={`${s.cardInfo} ${s.cardDays}`}>
                        <div className={s.cardTarget}>
                            <Tooltip text="Remaining until the end of the campaign." iconColor="#fff" className={s.tooltip}>
                                <Text fontSize="medium" fontWeight="bold">
                                    {formatNumberWithCommas(daysPassed)}
                                    {' / '}
                                    {formatNumberWithCommas(daysTarget)} days
                                </Text>
                            </Tooltip>
                        </div>
                        <Text fontSize="medium" fontWeight="bold">
                            {progressValueDays + '%'}
                        </Text>
                    </div>
                )}
                {description && (
                    <>
                        <ExpandableText text={description} />
                    </>
                )}
            </div>
        </div>
    )
}
