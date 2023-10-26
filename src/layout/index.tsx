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

const wrapperTgStyles = { headerStyles: { background: 'var(--tg-theme-secondary-bg-color)' } }
const headerStyles = { header: { background: 'var(--tg-theme-secondary-bg-color)' } }
const menuTgStyles = { menuContainer: { background: 'var(--tg-theme-bg-color)' } }

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
                    className={`${s.actionIcon}`}
                    color={path === ROUTES.HOME ? '#fff' : '#98989E' }
                    tgStyles={{ stroke: 'var(--tg-theme-text-color)'  }}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.HOME)
                navigate(ROUTES.HOME)
            },
            tgStyles: { item: { opacity: path === ROUTES.HOME ? '1' : '0.7' } }
        },
        {
            icon: (
                <IconSelector
                    id="plus"
                    size="30px"
                    className={`${s.actionIcon}`}
                    color={path === ROUTES.FUNDRAISER_CREATE ? '#fff' : '#98989E' }
                    tgStyles={{ stroke: 'var(--tg-theme-text-color)'  }}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.FUNDRAISER_CREATE)
                !rawAddress ? tonConnectUI.connectWallet() : navigate(ROUTES.FUNDRAISER_CREATE)
            },
            tgStyles: { item: { opacity: path === ROUTES.FUNDRAISER_CREATE ? '1' : '0.7' } }
        },
        {
            icon: (
                <IconSelector
                    id="user"
                    size="30px"
                    className={`${s.actionIcon}`}
                    color={path === ROUTES.PROFILE ? '#fff' : '#98989fff' }
                    tgStyles={{ stroke: 'var(--tg-theme-text-color)'  }}
                />
            ),
            text: '',
            onClick: () => {
                setActiveLink(ROUTES.PROFILE)
                !rawAddress ? tonConnectUI.connectWallet() : navigate(ROUTES.PROFILE)
            },
            tgStyles: { item: { opacity: path === ROUTES.PROFILE ? '1' : '0.7' } }
        }
    ]

    return (
        <PageWrapper
            className={s.wrapper}
            headerClassName={s.headerClass}
            containerWidth="500px"
            tgStyles={wrapperTgStyles}
            header={
                <HeaderPanel
                    title=""
                    containerWidth="440px"
                    className={s.header}
                    variant="black"
                    actionLeft={
                        <Link to={ROUTES.HOME} className={s.logo}>
                            <Text fontSize="large" fontWeight="bold" tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                                DeDonate
                            </Text>
                        </Link>
                    }
                    tgStyles={headerStyles}
                    style={{ background: '#222' }}
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
            }
            footer={
                <MobileMenu
                    borderRadius="100px"
                    items={MobileMenuItems}
                    className={s.actions}
                    tgStyles={menuTgStyles}
                />
            }
            pageTitle="DeDonate"
            content={<div className={s.content}>{children}</div>}
        />
    )
}
