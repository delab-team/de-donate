import { FC } from 'react'

import { TonConnectButton } from '@tonconnect/ui-react'
  
 interface HomePageProps {} 
  
 export const HomePage: FC<HomePageProps> = () => {
  return <div style={{ margin: '0 auto' }}><TonConnectButton /></div>
  };