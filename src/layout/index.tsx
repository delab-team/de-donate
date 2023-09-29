import { FC } from 'react'

import { PageWrapper, MobileMenu, MobileHeader } from '@delab-team/de-ui'

import { useNavigate } from 'react-router-dom'

import { ROUTES } from '../utils/router'

import s from './layout.module.scss'

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate()
    const MobileMenuItems = [
        { text: 'Home', onClick: () => navigate(ROUTES.HOME) },
        { text: 'Add', onClick: () => navigate(ROUTES.COLLECTING_CREATE) },
        { text: 'Profile', onClick: () => navigate(ROUTES.PROFILE) }
    ]
    const MobileHeaderItems = [
        { mobileComponent: <span className={s.logo}>Logo</span> },
        { mobileComponent: <div className={s.connect}>Connect <br /> + wallet adress</div> }
    ]
    return (
        <div className={s.wrapper}>
            <PageWrapper
            className={s.wrapper}
                header={<MobileHeader mobileClassName={s.header} mobileTop={MobileHeaderItems}></MobileHeader>}
                footer={<MobileMenu backgroundMenu="#3D3D3D" items={MobileMenuItems}></MobileMenu>}
                pageTitle="DeDonate"
                content={<div className={s.content}>
                    {children}
                </div>}
            />
        </div>
    )
}
