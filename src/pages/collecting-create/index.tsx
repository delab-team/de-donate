import { FC } from 'react'

import s from './collecting-create.module.scss'

interface CollectingCreateProps {}

export const CollectingCreate: FC<CollectingCreateProps> = () => <div className={s.inner}>
    <div className="link">Название</div>
    <div className="link">Описание</div>
    <div className="link">Цель сбора (сколько $)</div>
    <div className="link">Количество дней</div>
    <div className="link">Выбор обложки</div>
    <button className="link">Создать сбор</button>
</div>
