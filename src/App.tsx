import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Address, TonClient } from 'ton'
import { TonConnectUI, TonConnectUIContext, useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { ProviderTonConnect } from '@delab-team/ton-network-react'

import { FundraiserCreate } from './pages/fundraiser-create'
import { FundraiserDetail } from './pages/fundraiser-detail'
import { FundraiserUpdate } from './pages/fundraiser-update'
import { Profile } from './pages/profile'
import { HomePage } from './pages/home'

import { ROUTES } from './utils/router'
import { fixAmount } from './utils/fixAmount'

import { Layout } from './layout'

import { Ton } from './logic/ton'

const isTestnet = window.location.host.indexOf('localhost') >= 0
    ? true
    : window.location.href.indexOf('testnet') >= 0

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)

    const [ isConnected, setIsConnected ] = useState<boolean>(false)
    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const RawAddress = useTonAddress()

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
            Ton.getBalanceProfile(RawAddress, isTestnet).then((bl) => {
                setBalance(fixAmount(bl.toString()))
            })
        }
    }, [ RawAddress ])

    return (
        <Layout>
            <Routes>
                <Route element={<HomePage />} path={ROUTES.HOME} />
                <Route element={<FundraiserCreate />} path={ROUTES.FUNDRAISER_CREATE} />
                <Route element={<FundraiserDetail />} path={ROUTES.FUNDRAISER_DETAIL} />
                <Route element={<FundraiserUpdate />} path={ROUTES.FUNDRAISER_UPDATE} />
                <Route element={<Profile balance={balance} />} path={ROUTES.PROFILE} />
                <Route path="*" element={<Navigate to='/' replace />} />
            </Routes>
        </Layout>
    )
}
