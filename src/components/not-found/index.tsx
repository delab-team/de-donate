import { FC } from 'react'
import { Title } from '@delab-team/de-ui'

import s from './not-found.module.scss'

interface NotFoundProps {
    text: React.ReactNode;
}

export const NotFound: FC<NotFoundProps> = ({ text }) => (
    <div className={s.notFound}>
        <Title variant="h4">{text}</Title>
    </div>
)
