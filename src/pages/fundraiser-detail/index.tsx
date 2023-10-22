/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Div, Input, Modal, Text, Title } from '@delab-team/de-ui'
import { SendTransactionRequest, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { Address, Cell, toNano } from 'ton-core'

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
}

const editButtonTg = { background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)', border: 'none' }

const withdrawalModalTg = { modalContent: { background: 'var(--tg-theme-bg-color)' }, closeButton: { color: 'var(--tg-theme-text-color)' } }
const withdrawalModalInputTg = { input: { background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)', border: '1px solid #B7B7BB' } }

export const FundraiserDetail: FC<FundraiserDetailProps> = ({ addressCollection, isTestnet, isTg }) => {
    const { id } = useParams()
    const [ first, setFirst ] = useState<boolean>(false)

    const navigate = useNavigate()

    const rawAddress = useTonAddress(false)

    const [ fundData, setFundData ] = useState<FundType & FundDetailType>({
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

    const [ withdrawalData, setWithdrawalData ] = useState<Record <string, string>>({
        address: rawAddress,
        amount: '',
        asset: 'WTON',
        tokenAddress: jettons[0].address[Number(isTestnet)]
    })

    const [ jettonWithdrawal, setJettonWithdrawal ] = useState<string>(jettons[0].value)

    const jettonSelectWithdrawal = ({ token, tokenAddress }: { token: string, tokenAddress: string }) => {
        setJettonWithdrawal(token)
        setWithdrawalData({
            ...withdrawalData,
            token,
            tokenAddress
        })
    }

    // Withdrawal modal end

    const [ loading, setLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const [ data, setData ] = useState<DataType>({
        amount: '',
        token: 'WTON',
        tokenAddress: jettons[0].address[Number(isTestnet)]
    })

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const handleSelect = ({ token, tokenAddress }: { token: string, tokenAddress: string }) => {
        setSelectedValue(token)
        setData({
            ...data,
            token,
            tokenAddress
        })
    }

    const isOwnFund = rawAddress === fundData.ownerAddress

    async function donate (addressToken: string) {
        if (!id) {
            return
        }
        const smart = new Smart(tonConnectUI, true)

        const addressWalletUser = await smart.getWalletAddressOf(rawAddress, addressToken)

        if (!addressWalletUser) {
            return
        }

        console.log('addressWalletUser', addressWalletUser.toString())

        const tr = await smart.sendTransfer(addressWalletUser.toString(), Address.parse(id), toNano(data.amount))

        if (tr) setIsDonated(true)
    }

    useEffect(() => {
        if (!first) {
            if (!id) {
                return
            }
            setFirst(true)
            setLoading(true)

            const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

            const smart = new Smart(tonConnectUI, true)

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

                setTimeout(() => {
                    setLoading(false)
                }, 200)
                console.log(error)
                // navigate('/')
            })
        }

        return () => {
            setFundData({
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

    return (
        <div className={s.inner}>
            {isDonated && (
                <AlertModal isOpen={isDonated} onClose={() => setIsDonated(false)} content={<Text tgStyles={{ color: 'var(--tg-theme-text-color)' }} className={s.textModal}>The <span>{fundData.title}</span> fund has been successfully donated!</Text>}  />
            )}
            {isWithdrawal && (
                <Modal isOpen={isWithdrawal} onClose={() => setIsWithdrawal(false)} tgStyles={withdrawalModalTg}>
                    <div className={s.withdrawalModal}>
                        <Title variant="h5" className={s.withdrawalModalTitle} tgStyles={ { color: 'var(--tg-theme-text-color)' } }>Withdrawal</Title>
                        <Input className={`input ${s.withdrawalModalInput}`} value={rawAddress} variant='black' onChange={() => {}} tgStyles={withdrawalModalInputTg} />
                        <Amount
                            options={jettons}
                            value={String(withdrawalData.amount)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setWithdrawalData({
                                    ...withdrawalData,
                                    amount: e.target.value
                                })
                            }}
                            selectedValue={jettonWithdrawal}
                            handleSelect={jettonSelectWithdrawal}
                            detailStyles
                            isTestnet={isTestnet}
                        />
                        <Button
                            rounded="l"
                            size="stretched"
                            className="action-btn"
                            disabled={withdrawalData.amount.length < 1}
                            tgStyles={editButtonTg}
                        >
                            Submit
                        </Button>
                    </div>
                </Modal>
            )}
            {loading ? (
                <FundDetailSkeleton isTg={isTg} />
            ) : (
                <FundCard
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

            <Div className={s.innerActions} tgStyles={{ background: 'var(--tg-theme-bg-color)' }}>
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
            </Div>

            {isOwnFund && (
                <div className={s.actionsButtons}>
                    <Button
                        className={s.editButton}
                        onClick={() => navigate(`/fundraiser-update/${id}`)}
                        tgStyles={editButtonTg}
                    >
                        Edit
                    </Button>
                    <Button className={s.editButton} onClick={() => setIsWithdrawal(true)}
                        tgStyles={editButtonTg}
                    >
                        Withdrawal
                    </Button>
                </div>
            )}
        </div>
    )
}
