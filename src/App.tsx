/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Address, TonClient } from 'ton'
import { TonConnectUI, TonConnectUIContext, useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { ProviderTonConnect } from '@delab-team/ton-network-react'
import { AppInner } from '@delab-team/de-ui'

import { FundraiserCreate } from './pages/fundraiser-create'
import { FundraiserDetail } from './pages/fundraiser-detail'
import { FundraiserUpdate } from './pages/fundraiser-update'
import { Profile } from './pages/profile'
import { HomePage } from './pages/home'

import { ROUTES } from './utils/router'
import { fixAmount } from './utils/fixAmount'
import { PrivateRoute } from './utils/privateRouter'

import { Layout } from './layout'

import { Smart } from './logic/smart'
import { TonApi } from './logic/tonapi'

declare global {
    interface Window {
        Telegram?: any
    }
}

const isTestnet = window.location.host.indexOf('localhost') >= 0
    ? true
    : window.location.href.indexOf('testnet') >= 0

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)

    const [ isConnected, setIsConnected ] = useState<boolean>(false)
    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const RawAddress = useTonAddress()

    const api = new TonApi('testnet')

    async function loadUser (address: string): Promise<boolean | undefined> {
        const data = await api.getInfoUserV2(address)

        if (!data || !data?.balance) {
            return undefined
        }

        setBalance(data?.balance.toString())

        return true
    }

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            // const wallet = TonConnectUIContext
            if (tonConnectUI) {
                const networkProvider = new ProviderTonConnect(tonConnectUI, isTestnet)
                console.log(networkProvider)
            }
        }
    }, [])

    useEffect(() => {
        if (RawAddress) {
            Smart.getBalanceProfile(RawAddress, isTestnet).then((bl) => {
                setBalance(fixAmount(bl.toString()))
                loadUser(RawAddress)
            })
        }
    }, [ RawAddress ])

    return (
        <AppInner isTg={isTg}>
            <Layout>
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route element={<FundraiserCreate />} path={ROUTES.FUNDRAISER_CREATE} />
                        <Route element={<FundraiserUpdate />} path={ROUTES.FUNDRAISER_UPDATE} />
                        <Route element={<Profile balance={balance} />} path={ROUTES.PROFILE} />
                    </Route>

                    <Route element={<HomePage />} path={ROUTES.HOME} />
                    <Route path={ROUTES.FUNDRAISER_DETAIL} element={<FundraiserDetail />}  />
                    <Route path="*" element={<Navigate to='/' replace />} />
                </Routes>
            </Layout>
        </AppInner>
    )
}
