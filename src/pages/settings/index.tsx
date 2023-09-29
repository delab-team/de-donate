import { FC } from 'react'

import s from './settings.module.scss'

interface SettingsProps {}

export const Settings: FC<SettingsProps> = () => <div className={s.inner}>
    <div className="link">Название</div>
    <div className="link">Описание</div>
    <div className="link">Баланс</div>
    <button className="link">Закрыть сбор</button>
    <button className="link">Вывод</button>
</div>
