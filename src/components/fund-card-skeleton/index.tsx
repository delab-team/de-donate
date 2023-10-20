import { FC } from 'react'
import ContentLoader from 'react-content-loader'
import { Div } from '@delab-team/de-ui'

import s from './fund-card-skeleton.module.scss'

interface FundCardSkeletonProps {
    isTg: boolean;
}

export const FundCardSkeleton: FC<FundCardSkeletonProps> = ({ isTg, ...rest }) => (
    <Div className={s.skeletonInner} tgStyles={{ background: '#fff' }}>
        <ContentLoader
            speed={2}
            width="100%"
            height="100%"
            viewBox="0 0 440 250"
            backgroundColor={isTg ? 'var(--tg-theme-bg-color)' : '#3d3d3d'}
            foregroundColor={isTg ? 'var(--tg-theme-secondary-bg-color)' : '#545151'}
            style={{ borderRadius: '20px 20px 0 0' }}
            {...rest}
        >
            <rect x="0" y="0" rx="9" ry="9" width="440" height="154" />
            <rect x="19" y="168" rx="9" ry="9" width="146" height="19" />
            <rect x="19" y="214" rx="9" ry="9" width="96" height="24" />
            <rect x="20" y="198" rx="3" ry="3" width="410" height="3" />
            <rect x="332" y="214" rx="9" ry="9" width="96" height="24" />
            <rect x="19" y="255" rx="9" ry="9" width="96" height="24" />
            <rect x="332" y="252" rx="9" ry="9" width="96" height="24" />
        </ContentLoader>

    </Div>
)
