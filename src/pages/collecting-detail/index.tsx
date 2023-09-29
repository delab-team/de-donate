import { FC } from 'react'

import s from './collecting-detail.module.scss'

interface CollectingDetailProps {}

export const CollectingDetail: FC<CollectingDetailProps> = () => <div className={s.inner}>
    <div className={s.img}>
      Img
    </div>
    <div className={s.title}>Name</div>
    <div className={s.description}>
      Description
    </div>
    <div className={s.info}>
        <div className="link">Donate</div>
        <div className="link">Edit</div>
    </div>
</div>
