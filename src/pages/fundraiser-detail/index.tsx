/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/space-infix-ops */
/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Div, Input, Modal, Text, Title } from '@delab-team/de-ui'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Address, fromNano, toNano } from 'ton-core'

import { FundCard } from '../../components/fund-card'
import { Amount } from '../../components/amount'
import { FundDetailSkeleton } from '../../components/fund-detail-skeleton'
import { AlertModal } from '../../components/alert-modal'

import { jettons } from '../../constants/jettons'

import { formatNumberWithCommas } from '../../utils/formatNumberWithCommas'

import { Item, TonApi } from '../../logic/tonapi'
import { Smart } from '../../logic/smart'
import { loadFund } from '../../logic/loadFund'

import { FundDetailType, FundType } from '../../@types/fund'

import s from './fundraiser-detail.module.scss'

import IMG1 from '../../assets/img/01.png'

interface FundraiserDetailProps {
    addressCollection: string[],
    isTestnet: boolean,
    isTg: boolean
}

type DataType = {
    amount: string;
    token: string;
    tokenAddress: string;
    decimals: number;
}

type TokenBalancesType = {
    balance: string;
    token: string;
    tokenAddress: string
}

type WithdrawalType = {
    address: string,
    amount: string,
    asset: string,
    tokenAddress: string
}

const editButtonTg = { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)', border: 'none' }

const withdrawalModalTg = { modalContent: { background: 'var(--tg-theme-bg-color)' }, closeButton: { color: 'var(--tg-theme-text-color)' } }
const withdrawalModalInputTg = { input: { background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)', border: '1px solid #B7B7BB' } }

export const FundraiserDetail: FC<FundraiserDetailProps> = ({ isTestnet, isTg }) => {
    const { id } = useParams()
    const [ first, setFirst ] = useState<boolean>(false)
    const [ firstLoadTokens, setFirstLoadTokens ] = useState<boolean>(false)

    const navigate = useNavigate()

    const rawAddress = useTonAddress(false)

    const [ fundData, setFundData ] = useState<FundType & FundDetailType>({
        id: '',
        addressFund: '',
        amount: 0,
        img: '',
        asset: '',
        target: 0,
        title: '',
        description: '',
        daysTarget: 0,
        daysPassed: 0,
        ownerAddress: '',
        type: 0,
        verificated: false
    })

    // Success donate modal
    const [ isDonated, setIsDonated ] = useState<boolean>(false)

    // Withdrawal modal
    const [ isWithdrawal, setIsWithdrawal ] = useState<boolean>(false)

    const [ withdrawalData, setWithdrawalData ] = useState<WithdrawalType>({
        address: rawAddress,
        amount: '',
        asset: 'WTON',
        tokenAddress: jettons[0].address[Number(isTestnet)]
    })

    const [ jettonWithdrawal, setJettonWithdrawal ] = useState<string>(jettons[0].value)

    // Withdrawal modal end

    const [ loading, setLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const [ data, setData ] = useState<DataType>({
        amount: '',
        token: 'WTON',
        tokenAddress: jettons[0].address[Number(isTestnet)],
        decimals: 9
    })

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    // Balance Token State
    const [ tokenBalance, setTokenBalance ] = useState<string | undefined>(undefined)

    // Handle Select Amount
    const handleSelect = ({ token, tokenAddress, decimals }: { token: string, tokenAddress: string, decimals: number }) => {
        setSelectedValue(token)
        setData({
            ...data,
            token,
            tokenAddress,
            decimals
        })
    }

    const isOwnFund = rawAddress === fundData.ownerAddress

    async function setPriority (asset: string) {
        const priorityTokenArr = jettons.filter(j => j.label === asset)
        let priorityToken = jettons[0].address[Number(isTestnet)]
        let decimals = 9
        if (priorityTokenArr.length > 0) {
            priorityToken = priorityTokenArr[0].address[Number(isTestnet)]
            decimals = priorityTokenArr[0].decimals
        }
        setData({
            amount: '',
            token: asset,
            tokenAddress: priorityToken,
            decimals
        })

        setSelectedValue(asset)

        console.log('asset', asset)
    }

    async function Withdrawal () {
        if (!id) {
            return
        }

        const address = jettons.filter(j => j.label === selectedValue)[0].address[Number(isTestnet)]

        const smart = new Smart(tonConnectUI, isTestnet)
        const wallet = await smart.getWalletAddressOf(id, address)

        if (!wallet) return

        const res = await smart.sendClaim(id, [ wallet ])
        if (res) setIsDonated(true)
    }

    async function returnMoney () {
        if (!id) {
            return
        }
        const smart = new Smart(tonConnectUI, isTestnet)

        const helper = await smart.getHelperAddress(Address.parse(id))

        if (!helper) return

        const res = await smart.sendReturn(helper.toString())

        if (res) setIsDonated(true)
    }

    async function donate (addressToken: string) {
        if (!id) {
            return
        }
        const smart = new Smart(tonConnectUI, isTestnet)

        console.log('addressToken', addressToken)

        const addressWalletUser = await smart.getWalletAddressOf(rawAddress, addressToken)

        if (!addressWalletUser) {
            return
        }

        console.log('addressWalletUser', addressWalletUser.toString())

        const tr = await smart.sendTransfer(addressWalletUser.toString(), Address.parse(id), toNano(data.amount))

        if (tr) setIsDonated(true)
    }

    // Tokens Balance START

    const [ tokenBalances, setTokenBalances ] = useState<TokenBalancesType[]>([])

    const tokensToLoad = jettons.map(el => ({
        token: el.label,
        tokenAddress: el.address[Number(isTestnet)],
        decimals: el.decimals
    }))

    async function loadAllTokenBalances () {
        if (!rawAddress || !isOwnFund || !id) {
            return
        }

        const smart = new Smart(tonConnectUI, isTestnet)
        const balancePromises = tokensToLoad.map(async (tokenInfo) => {
            const addressWalletUser = await smart.getWalletAddressOf(id, tokenInfo.tokenAddress)
            if (addressWalletUser) {
                const balanceToken = await smart.getJettonBalance(String(addressWalletUser))
                if (balanceToken !== undefined) {
                    let balance = fromNano(balanceToken).toString()

                    if (tokenInfo.decimals !== 9) {
                        balance = (balanceToken * 10n ** BigInt(tokenInfo.decimals)).toString()
                    }
                    return {
                        ...tokenInfo,
                        balance
                    }
                }
            }
            return null
        })

        const balances = await Promise.all(balancePromises)
        const balancesResult = balances.filter(balance => balance !== null) as TokenBalancesType[]

        setTokenBalances(balancesResult)

        if (!firstLoadTokens) {
            const tokenBalanceDefault = balancesResult.find((el: { token: string, tokenAddress: string }) => el.tokenAddress === jettons[0].address[Number(isTestnet)])
            setTokenBalance(tokenBalanceDefault?.balance)
        }
        setFirstLoadTokens(true)
    }

    useEffect(() => {
        if (id) {
            loadAllTokenBalances()
        }
    }, [ id, rawAddress, isOwnFund ])

    const jettonSelectWithdrawal = async ({ token, tokenAddress, decimals }: { token: string, tokenAddress: string, decimals: number }) => {
        setJettonWithdrawal(token)

        const selectedTokenBalance = tokenBalances.find((balance: { token: string, tokenAddress: string }) => balance.tokenAddress === tokenAddress)

        if (selectedTokenBalance) {
            setTokenBalance(selectedTokenBalance.balance)
        } else {
            const smart = new Smart(tonConnectUI, isTestnet)
            const addressWalletUser = await smart.getWalletAddressOf(rawAddress, tokenAddress)
            if (addressWalletUser) {
                const balanceToken = await smart.getJettonBalance(String(addressWalletUser))
                if (balanceToken !== undefined) {
                    let balance = fromNano(balanceToken).toString()

                    if (decimals !== 9) {
                        balance = (balanceToken * 10n ** BigInt(decimals)).toString()
                    }
                    setTokenBalance(balance)
                }
            }
        }

        setWithdrawalData({
            ...withdrawalData,
            asset: token,
            tokenAddress
        })
    }

    // Tokens Balance END

    useEffect(() => {
        if (!first) {
            if (!id) {
                return
            }

            try {
                const addr = Address.parse(id)
            } catch (error) {
                navigate('/')
                return
            }
            setFirst(true)
            setLoading(true)

            const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

            const smart = new Smart(tonConnectUI, isTestnet)

            api.getItemV2(id).then(async (item: Item | undefined) => {
                if (item) {
                    const addressFund = id

                    if (addressFund === undefined) {
                        return
                    }

                    const fund = await loadFund(id, smart, isTestnet, item.owner?.address ?? '',  { daysPassed: true,  daysTarget: true, description: true })

                    if (!fund) {
                        navigate('/')
                        return
                    }
                    setFundData(fund as FundType & FundDetailType)

                    setPriority(fund.asset ?? 'WTON')

                    setTimeout(() => {
                        setLoading(false)
                    }, 200)
                }
            }).catch(async (error) => {
                const fund = await loadFund(id, smart, isTestnet, '')

                if (!fund) {
                    navigate('/')
                    return
                }
                setFundData(fund as FundType & FundDetailType)

                setPriority(fund.asset ?? 'WTON')

                setTimeout(() => {
                    setLoading(false)
                }, 200)
                console.log(error)
            // navigate('/')
            })
        }

        return () => {
            setFundData({
                id: '',
                addressFund: '',
                amount: 0,
                img: '',
                asset: '',
                target: 0,
                title: '',
                description: '',
                daysTarget: 0,
                daysPassed: 0,
                ownerAddress: '',
                type: 0,
                verificated: false
            })
        }
    }, [ id ])

    const updatedJettons = jettons.map((jetton: any) => {
        const matchingTokenBalance = tokenBalances.find(balance => balance.token === jetton.label)
        if (matchingTokenBalance) {
            jetton.balance = matchingTokenBalance.balance
        }
        return jetton
    })

    return (
        <div className={s.inner}>
            {isDonated && (
                <AlertModal isOpen={isDonated} onClose={() => setIsDonated(false)} content={<Text tgStyles={{ color: 'var(--tg-theme-text-color)' }} className={s.textModal}>The <span>{fundData.title}</span> fund has been successfully transaction!</Text>}  />
            )}
            {isWithdrawal && (
                <Modal isOpen={isWithdrawal} onClose={() => setIsWithdrawal(false)} tgStyles={withdrawalModalTg}>
                    <div className={s.withdrawalModal}>
                        <Title variant="h5" className={s.withdrawalModalTitle} tgStyles={ { color: 'var(--tg-theme-text-color)' } }>Withdrawal</Title>
                        <Input className={`input ${s.withdrawalModalInput}`} value={Address.parse(rawAddress).toString()} variant='black' onChange={() => {}} tgStyles={withdrawalModalInputTg} />
                        <Amount
                            options={updatedJettons}
                            value={tokenBalance || '0'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setWithdrawalData({
                                    ...withdrawalData,
                                    amount: e.target.value
                                })
                            }}
                            selectedValue={jettonWithdrawal}
                            handleSelect={jettonSelectWithdrawal}
                            detailStyles
                            onlyRead
                            isTestnet={isTestnet}
                            showBalanceToken
                        />
                        <Button
                            rounded="l"
                            size="stretched"
                            className="action-btn"
                            disabled={Number(withdrawalData.amount) !== 0}
                            tgStyles={editButtonTg}
                            onClick={() => Withdrawal()}
                        >
                            Withdrawal
                        </Button>
                    </div>
                </Modal>
            )}
            {loading ? (
                <FundDetailSkeleton isTg={isTg} />
            ) : (
                <FundCard
                    id={fundData.id}
                    title={fundData.title}
                    asset={fundData.asset}
                    target={fundData.target}
                    img={fundData.img || IMG1}
                    amount={fundData.amount}
                    daysTarget={fundData.daysTarget}
                    daysPassed={fundData.daysPassed}
                    formatNumberWithCommas={formatNumberWithCommas}
                    description={fundData.description}
                    verificated={fundData.verificated}
                    fundType={fundData.type}
                />
            )}

            {!fundData.verificated || fundData.daysTarget > 0
                ? <Div className={s.innerActions} tgStyles={{ background: 'var(--tg-theme-bg-color)' }}>
                    <div className={s.amountInner}>
                        <Amount
                            options={jettons}
                            value={String(data.amount)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setData({
                                    ...data,
                                    amount: e.target.value
                                })
                            }}
                            selectedValue={selectedValue}
                            handleSelect={handleSelect}
                            detailStyles
                            isTestnet={isTestnet}
                            disabled={fundData.type === 0}
                        />
                    </div>
                    <Button
                        rounded="l"
                        size="stretched"
                        className="action-btn"
                        disabled={Number(data.amount) < 0.0001 || isNaN(parseFloat(data.amount))}
                        onClick={() => (rawAddress ? donate(data.tokenAddress) : tonConnectUI.connectWallet())}
                        tgStyles={editButtonTg}
                    >
                    Donate Now
                    </Button>
                </Div> : null }

            {isOwnFund && (
                <div className={s.actionsButtons}>
                    <Button className={s.editButton} onClick={() => setIsWithdrawal(true)}
                        tgStyles={editButtonTg}
                    >
                        Withdrawal
                    </Button>
                </div>
            )}

            {fundData.daysTarget <= 0 && fundData.verificated && fundData.amount < fundData.target && (
                <Button
                    className={s.editButton}
                    onClick={() => returnMoney()}
                    tgStyles={editButtonTg}
                >
                Return fund
                </Button>
            )}
        </div>
    )
}
