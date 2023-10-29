/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
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
        Telegram?: any;
    }
}

const isTestnet = window.location.host.indexOf('localhost') >= 0
    ? true
    : window.location.href.indexOf('testnet') >= 0

// const isTestnet = false

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)

    const [ balance, setBalance ] = useState<string | undefined>(undefined)

    const [ createdFund, setCreatedFund ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const navigate = useNavigate()

    const RawAddress = useTonAddress()

    const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

    const addressCollection = [ 'EQDtUbSCZk7aA9HHezxLJyzmMpWabMeo0KAG7gdm_ds3qkt4', 'EQBVdUsIL3jBn211_wrFwm8AJBnF_r9kefjgcOfrU8a2yyHp' ]

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

            if (tonConnectUI) {
                const networkProvider = new ProviderTonConnect(tonConnectUI, isTestnet)
                console.log(networkProvider)
            }

            const isTgCheck = window.Telegram.WebApp.initData !== ''
            const TgObj = window.Telegram.WebApp
            const bodyStyle = document.body.style

            setIsTg(isTgCheck)
            if (isTgCheck) {
                TgObj.ready()
                TgObj.enableClosingConfirmation()
                TgObj.expand()
                setIsTg(true)
                bodyStyle.backgroundColor = 'var(--tg-theme-secondary-bg-color)'
                bodyStyle.setProperty('background-color', 'var(--tg-theme-secondary-bg-color)', 'important')

                // const id = TgObj.tgWebAppStartParam()
                const search = window.location.search.slice(1)
                const searchParams = new URLSearchParams(search)
                const id = searchParams.get('tgWebAppStartParam')
                // if (id) {
                //     navigate('/fundraiser-detail/' + id)
                // }
                if (id) {
                    navigate('/fundraiser-detail/' + id)
                }
            }
        }
    }, [])

    useEffect(() => {
        if (RawAddress) {
            // Smart.getBalanceProfile(RawAddress, isTestnet).then((bl) => {
            //     setBalance(fixAmount(bl.toString()))
            //     loadUser(RawAddress)
            // })

            loadUser(RawAddress)
        }
    }, [ RawAddress ])

    return (
        <AppInner isTg={isTg}>
            <Layout>
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route element={
                            <FundraiserCreate
                                addressCollection={addressCollection}
                                isTestnet={isTestnet}
                                setCreatedFund={setCreatedFund}
                            />}
                        path={ROUTES.FUNDRAISER_CREATE}
                        />
                        <Route element={<FundraiserUpdate isTestnet={isTestnet} />} path={ROUTES.FUNDRAISER_UPDATE} />
                        <Route element={
                            <Profile
                                balance={balance}
                                addressCollection={addressCollection}
                                isTestnet={isTestnet}
                                createdFund={createdFund}
                                setCreatedFund={setCreatedFund}
                                isTg={isTg}
                            />}
                        path={ROUTES.PROFILE}
                        />
                    </Route>

                    <Route element={
                        <HomePage
                            addressCollection={addressCollection}
                            isTestnet={isTestnet}
                            isTg={isTg}
                        />}
                    path={ROUTES.HOME}
                    />
                    <Route path={ROUTES.FUNDRAISER_DETAIL} element={
                        <FundraiserDetail
                            addressCollection={addressCollection}
                            isTestnet={isTestnet}
                            isTg={isTg}
                        />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </AppInner>
    )
}
