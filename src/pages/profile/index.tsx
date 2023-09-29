import { FC } from 'react'

import { Link } from 'react-router-dom'
import s from './profile.module.scss'
import { ROUTES } from '../../utils/router'

interface ProfileProps {}

export const Profile: FC<ProfileProps> = () => <div className={s.profile}>
    <div>
        <div className="link">Адресс кошелька</div>
        <div className={s.profileActions}>
            <div className={`${s.profileActionsLink} link`}>Общий баланс</div>
            <Link to="#" className={`${s.profileActionsLink} link`}>Вывод</Link>

        </div>
    </div>
    <Link to={ROUTES.COLLECTING_DETAIL} className="link">Сбор один</Link>
    <Link to={ROUTES.COLLECTING_DETAIL} className="link">Сбор два</Link>
    <Link to={ROUTES.COLLECTING_DETAIL} className="link">Сбор три</Link>
</div>
