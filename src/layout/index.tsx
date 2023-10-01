/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FC } from 'react'

import { PageWrapper, MobileMenu, IconSelector, HeaderPanel, Text, Button } from '@delab-team/de-ui'

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

    const MobileMenuItems = [
        {
            icon: <IconSelector id="home" size="30px" className={s.actionIcon} />,
            text: '',
            onClick: () => {
                navigate(ROUTES.HOME)
            }
        },
        {
            icon: <IconSelector id="plus" size="30px" className={s.actionIcon} />,
            text: '',
            onClick: () => {
                !rawAddress ? tonConnectUI.connectWallet() : navigate(ROUTES.FUNDRAISER_CREATE)
            }
        },
        {
            icon: <IconSelector id="user" size="30px" className={s.actionIcon} />,
            text: '',
            onClick: () => {
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
                            variant='black'
                            actionLeft={
                                <Link to={ROUTES.HOME} className={s.logo}>
                                    <Text fontSize='large' fontWeight='bold'>
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
                        borderRadius='100px'
                        items={MobileMenuItems}
                        className={s.actions}
                    />
                }
                pageTitle="DeDonate"
                content={<div className={s.content}>
                    {children}
                </div>}
            />
        </div>
    )
}
