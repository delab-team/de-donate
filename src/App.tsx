import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Address, TonClient } from 'ton'
import { TonConnectUI, TonConnectUIContext, useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { ProviderTonConnect } from '@delab-team/ton-network-react'

import { ROUTES } from './utils/router'
import { HomePage } from './pages/home'
import { Layout } from './layout'
import { CollectingCreate } from './pages/collecting-create'
import { CollectingDetail } from './pages/collecting-detail'
import { Settings } from './pages/settings'
import { Profile } from './pages/profile'


const isTestnet = window.location.host.indexOf('localhost') >= 0
    ? true
    : window.location.href.indexOf('testnet') >= 0

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)

    const [ isConnected, setIsConnected ] = useState<boolean>(false)
    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const [tonConnectUI, setOptions] = useTonConnectUI();

    const [ tonClient, setTonClient ] = useState<TonClient>(
        new TonClient({
            endpoint: isTestnet
                ? 'https://testnet.tonhubapi.com/jsonRPC'
                : 'https://mainnet.tonhubapi.com/jsonRPC'
        })
    )

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
            tonClient.getBalance(Address.parse(RawAddress)).then((bl) => {
                setBalance(bl.toString())
            })
        }
    }, [ RawAddress ])

    return (
        <Layout>
            <Routes>
                <Route element={<HomePage />} path={ROUTES.HOME} />
                <Route element={<CollectingCreate />} path={ROUTES.COLLECTING_CREATE} />
                <Route element={<CollectingDetail />} path={ROUTES.COLLECTING_DETAIL} />
                <Route element={<Profile />} path={ROUTES.PROFILE} />
                <Route element={<Settings />} path={ROUTES.SETTINGS} />
                <Route path="*" element={<Navigate to='/' replace />} />
            </Routes>
        </Layout>
    )
}
