/* eslint-disable import/no-unresolved */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

import { App } from './App'

import './index.scss'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/delab-team/de-donate/main/connect.txt">
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </TonConnectUIProvider>
)
