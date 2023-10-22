/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */
import { FC } from 'react'
import { Div, ProgressBar, Text } from '@delab-team/de-ui'

import { ExpandableText } from '../expandable-text'

import s from './fund-card.module.scss'

import TON from '../../assets/icons/ton.svg'
import TIME from '../../assets/icons/time.svg'

import VERIFICATED from '../../assets/icons/verificated.svg'
import NOT_VERIFICATED from '../../assets/icons/error.svg'
import { jettons } from '../../constants/jettons'

interface FundCardProps {
    img: string;
    title: string;
    amount: number;
    asset: string;
    target: number;
    description?: string;
    daysTarget?: number;
    daysPassed?: number;
    fundType?: number;
    verificated: boolean;
    formatNumberWithCommas: (number: number) => string;
}

const cardTg = { background: 'var(--tg-theme-bg-color)' }
const cardTextTg = { color: 'var(--tg-theme-text-color)' }

export const FundCard: FC<FundCardProps> = ({
    img,
    title,
    amount,
    asset,
    target,
    daysTarget,
    daysPassed,
    description,
    fundType,
    verificated,
    formatNumberWithCommas
}) => {
    const progressValue = ((amount / target) * 100).toFixed(2)
    let progressValueDays = null
    if (daysTarget !== undefined && daysPassed !== undefined) {
        progressValueDays = ((daysPassed / daysTarget) * 100).toFixed(2)
    }

    function assetImg () {
        const jetton = jettons.filter(j => j.label === asset)
        if (jetton.length > 0) {
            return jetton[0].image
        }
        return TON
    }

    return (
        <div className={s.card}>
            <div className={s.cardTop} style={{ backgroundImage: `url(${img})` }} />
            <Div className={s.cardDetail} tgStyles={cardTg}>
                <div className={s.cardDetailTop}>
                    <Text className={s.title} tgStyles={cardTextTg}>{title}</Text>
                    <img src={verificated ? VERIFICATED : NOT_VERIFICATED} width="18" height="18" alt="verificated icon" />
                </div>
                <ProgressBar
                    type="default"
                    size="large"
                    progress={Number(progressValue)}
                    color="blue"
                    className={s.progressBar}
                />
                <div className={s.cardInfo}>
                    <div className={s.cardTarget}>
                        <img
                            src={
                                assetImg()
                            }
                            width="36"
                            height="36"
                            style={{ borderRadius: '36px' }}
                            alt="ton icon"
                        />
                        <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                            {formatNumberWithCommas(amount)}
                            {' / '}
                            {formatNumberWithCommas(target)}
                            {' '}
                            {asset}
                        </Text>
                    </div>
                    <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                        {!isNaN(parseInt(progressValue, 10)) ? `${progressValue}%` : '0.00%'}
                    </Text>
                </div>
                {daysTarget && daysPassed && fundType !== 1 && daysTarget > 0 ? (
                    <div className={`${s.cardInfo} `}>
                        <div className={s.cardTarget}>
                            <img src={TIME} className={s.cardTime} width="36" height="36" alt="time icon" />
                            <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                                {formatNumberWithCommas(daysPassed)}
                                {' / '}
                                {formatNumberWithCommas(daysTarget)} days
                            </Text>
                        </div>
                        <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                            {progressValueDays + '%'}
                        </Text>
                    </div>
                ) : (<></>)}

                {daysTarget && daysPassed ? (
                    <div className={`${s.cardInfo} ${s.cardDays}`}>
                        <div className={s.cardTarget}>
                            <img src={verificated ? VERIFICATED : NOT_VERIFICATED} width="36" height="36" alt="verificated icon" />
                            <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                                {verificated ? 'Money back guarantee' : 'Money cannot be returned'}
                            </Text>
                        </div>
                    </div>
                ) : (<></>)}
                {description && (
                    <>
                        <ExpandableText text={description} />
                    </>
                )}
            </Div>
        </div>
    )
}
