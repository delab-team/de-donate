/* eslint-disable import/no-extraneous-dependencies */
import { FC } from 'react'
import { Title } from '@delab-team/de-ui'
import Lottie, { Options } from 'react-lottie'

import * as disabledSticker from '../../assets/stickers/disabled.json'

import s from './temporarily-disabled.module.scss'

interface TemporarilyDisabledProps {}

export const TemporarilyDisabled: FC<TemporarilyDisabledProps> = () => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: disabledSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    return (
        <div className={s.content}>
            <Lottie
                options={approveOptions}
                height={220}
                isClickToPauseDisabled={true}
                width={220}
            />
            <Title variant="h1">Temporarily disabled</Title>
        </div>
    )
}
