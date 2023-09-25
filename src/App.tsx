import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Address, TonClient } from 'ton'
import { useTonAddress } from '@tonconnect/ui-react'

import { ROUTES } from './utils/router'
import { HomePage } from './pages/home'

const isTestnet = window.location.host.indexOf('localhost') >= 0
    ? true
    : window.location.href.indexOf('testnet') >= 0

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)

    const [ isConnected, setIsConnected ] = useState<boolean>(false)
    const [ balance, setBalance ] = useState<string | undefined>(undefined)

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
        <Routes>
            <Route element={<HomePage />} path={ROUTES.HOME} />
            <Route path="*" element={<Navigate to='/' replace />} />
        </Routes>
    )
}
