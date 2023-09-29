import { FC } from 'react'
import { ProgressBar, Text } from '@delab-team/de-ui'

import { Link } from 'react-router-dom'

import { ROUTES } from '../../utils/router'

import s from './fund-card.module.scss'

import TON from '../../assets/icons/ton.svg'
import { ExpandableText } from '../expandable-text'

interface FundCardProps {
    img: string;
    title: string;
    amount: number;
    target: number;
    description?: string;
    formatNumberWithCommas: (number: number) => string;
}

export const FundCard: FC<FundCardProps> = ({
    img,
    title,
    amount,
    target,
    description,
    formatNumberWithCommas
}) => {
    const progressValue = (amount / target) * 100

    return (
        <Link to={ROUTES.FUNDRAISER_DETAIL} className={s.card}>
            <div className={s.cardTop}>
                <img src={img} alt="img" />
            </div>
            <div className={s.cardDetail}>
                <div className={s.title}>{title}</div>
                <ProgressBar
                    type="default"
                    size="large"
                    progress={progressValue}
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
                    {description && (
                        <Text fontSize="medium" fontWeight="bold" customClassName={s.cardDescription}>
                            <ExpandableText text={description} />
                        </Text>
                    )}
                </div>
            </div>
        </Link>
    )
}
