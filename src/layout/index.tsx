/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC, useState } from 'react'

import { PageWrapper, MobileMenu, IconSelector, HeaderPanel, Text } from '@delab-team/de-ui'

import { Link, useNavigate } from 'react-router-dom'

import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'

import { ROUTES } from '../utils/router'

import s from './layout.module.scss'

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate()

    const [ tonConnectUI ] = useTonConnectUI()

    const rawAddress = useTonAddress()

    const path = window.location.pathname

    const [ activeLink, setActiveLink ] = useState<string>(path)

    const MobileMenuItems = [
        {
            icon: (
                <IconSelector
                    id="home"
                    size="30px"
                    className={`${s.actionIcon} ${path === ROUTES.HOME ? s.activeIcon : ''}`}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.HOME)
                navigate(ROUTES.HOME)
            }
        },
        {
            icon: (
                <IconSelector
                    id="plus"
                    size="30px"
                    className={`${s.actionIcon} ${
                        path === ROUTES.FUNDRAISER_CREATE ? s.activeIcon : ''
                    }`}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.FUNDRAISER_CREATE)
                !rawAddress ? tonConnectUI.connectWallet() : navigate(ROUTES.FUNDRAISER_CREATE)
            }
        },
        {
            icon: (
                <IconSelector
                    id="user"
                    size="30px"
                    className={`${s.actionIcon} ${path === ROUTES.PROFILE ? s.activeIcon : ''}`}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.PROFILE)
                !rawAddress ? tonConnectUI.connectWallet() : navigate(ROUTES.PROFILE)
            }
        }
    ]

    return (
        <div className={s.wrapper}>
            <PageWrapper
                className={s.wrapper}
                header={
                    <div className={s.innerHeader}>
                        <HeaderPanel
                            title=""
                            containerWidth={330}
                            className={s.header}
                            variant="black"
                            actionLeft={
                                <Link to={ROUTES.HOME} className={s.logo}>
                                    <Text fontSize="large" fontWeight="bold">
                                        DeDonate
                                    </Text>
                                </Link>
                            }
                            actionRight={
                                <>
                                    {rawAddress ? (
                                        <TonConnectButton />
                                    ) : (
                                        <button
                                            className={s.connectButton}
                                            onClick={() => tonConnectUI.connectWallet()}
                                        >
                                            Connect Wallet
                                        </button>
                                    )}
                                </>
                            }
                        />
                    </div>
                }
                footer={
                    <MobileMenu
                        backgroundMenu="#3D3D3D"
                        borderRadius="100px"
                        items={MobileMenuItems}
                        className={s.actions}
                    />
                }
                pageTitle="DeDonate"
                content={<div className={s.content}>{children}</div>}
            />
        </div>
    )
}
