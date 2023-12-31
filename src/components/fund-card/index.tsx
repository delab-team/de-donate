/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */
import { FC, useState } from 'react'
import { Alert, Button, Div, IconSelector, ProgressBar, Text } from '@delab-team/de-ui'
import { Address } from 'ton-core'
import { useNavigate } from 'react-router-dom'

import { ExpandableText } from '../expandable-text'

import s from './fund-card.module.scss'

import TON from '../../assets/icons/ton.svg'
import TIME from '../../assets/icons/time.svg'

import VERIFICATED from '../../assets/icons/verificated.svg'
import NOT_VERIFICATED from '../../assets/icons/error.svg'
import { jettons } from '../../constants/jettons'

interface FundCardProps {
    id: string;
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
    isLink?: boolean;
    formatNumberWithCommas: (number: number) => string;
}

const cardTg = { background: 'var(--tg-theme-bg-color)' }
const cardTextTg = { color: 'var(--tg-theme-text-color)' }

const ButtonTg = { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)', border: 'none'  }

export const FundCard: FC<FundCardProps> = ({
    id,
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
    isLink = false,
    formatNumberWithCommas
}) => {
    const navigate = useNavigate()

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

    const handleCopyAddress = (e: React.MouseEvent) => {
        if (!id) {
            console.error('Something went wrong')
            return
        }

        e.stopPropagation()

        const currentUrl = window.location.origin

        const isTgCheck = window.Telegram.WebApp.initData !== ''

        const idFund = Address.parse(id).toString()

        let finalUrl = currentUrl + '/fundraiser-detail/' + idFund

        if (isTgCheck) {
            finalUrl = 'https://t.me/delabtonbot/donate?startapp=' + idFund
        }

        const tempTextArea = document.createElement('textarea')
        tempTextArea.value = finalUrl
        tempTextArea.setAttribute('readonly', '')
        document.body.appendChild(tempTextArea)
        tempTextArea.select()
        document.execCommand('copy')
        document.body.removeChild(tempTextArea)
        alert('The fund link has been successfully copied!')
    }

    function share () {
        const isTgCheck = window.Telegram.WebApp.initData !== ''
        const TgObj = window.Telegram.WebApp

        const idFund = Address.parse(id).toString()
        const finalUrl = 'https://t.me/delabtonbot/donate?startapp=' + idFund + '&choose=users+groups+channels'
        window.open(finalUrl)
    }

    return (

        <div className={`${s.card} ${isLink && s.cardLink}`} onClick={() => isLink && navigate(`/fundraiser-detail/${id}`)}>
            <div className={s.cardTop} style={{ backgroundImage: `url(${img})` }} />
            <Div className={s.cardDetail} tgStyles={cardTg}>
                <div className={s.cardDetailTop}>
                    <div className={s.cardDetailTitle}>
                        <Text className={s.title} tgStyles={cardTextTg}>
                            {title}
                        </Text>
                        {verificated ? <img
                            src={verificated ? VERIFICATED : NOT_VERIFICATED}
                            width="18"
                            height="18"
                            alt="verificated icon"
                        /> : null }
                    </div>
                    <div onClick={handleCopyAddress}>
                        <IconSelector
                            id="external-link"
                            size="23px"
                            color="#fff"
                            className={s.cardCopy}
                            tgStyles={{ stroke: 'var(--tg-theme-link-color)' }}
                        />
                    </div>
                </div>
                <ProgressBar
                    type="default"
                    size="large"
                    progress={Number(progressValue)}
                    color="blue"
                    className={s.cardProgressBar}
                />
                <div className={s.cardInfo}>
                    <div className={s.cardTarget}>
                        <img
                            src={assetImg()}
                            width="32"
                            height="32"
                            style={{ borderRadius: '36px' }}
                            alt="ton icon"
                        />
                        <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                            {formatNumberWithCommas(amount ?? 0)}
                            {' / '}
                            {formatNumberWithCommas(target ?? 0)} {asset}
                        </Text>
                    </div>
                    <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                        {!isNaN(parseInt(progressValue, 10)) ? `${progressValue}%` : '0.00%'}
                    </Text>
                </div>
                {daysTarget && fundType == 0 && daysTarget > 0 ? (
                    <div className={`${s.cardInfo} `}>
                        <div className={s.cardTarget}>
                            <img
                                src={TIME}
                                className={s.cardTime}
                                width="32"
                                height="32"
                                alt="time icon"
                            />
                            <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                                left {formatNumberWithCommas(daysTarget)} days
                            </Text>
                        </div>
                        {/* <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                            {progressValueDays + '%'}
                        </Text> */}
                    </div>
                ) : (
                    <></>
                )}

                {daysTarget && fundType == 0 && daysTarget <= 0 ? (
                    <div className={`${s.cardInfo} `}>
                        <div className={s.cardTarget}>
                            <img
                                src={TIME}
                                className={s.cardTime}
                                width="32"
                                height="32"
                                alt="time icon"
                            />
                            <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                                Time is over
                            </Text>
                        </div>
                        {/* <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                            {progressValueDays + '%'}
                        </Text> */}
                    </div>
                ) : (
                    <></>
                )}

                {daysTarget && daysPassed ? (
                    <div className={`${s.cardInfo} ${s.cardDays}`}>
                        <div className={s.cardTarget}>
                            <img
                                src={verificated ? VERIFICATED : NOT_VERIFICATED}
                                width="32"
                                height="32"
                                alt="verificated icon"
                            />
                            <Text fontSize="medium" fontWeight="bold" tgStyles={cardTextTg}>
                                {verificated
                                    ? 'Money back guarantee'
                                    : 'Money cannot be returned'}
                            </Text>
                        </div>
                    </div>
                ) : (
                    <></>
                )}
                {description && (
                    <>
                        <ExpandableText text={description} />
                        <Button
                            className={s.cardShareButton}
                            variant={'outline'}
                            onClick={handleCopyAddress}
                            tgStyles={ButtonTg}
                        >
                            Share
                        </Button>
                    </>
                )}
            </Div>
        </div>
    )
}
