/* eslint-disable max-len */
import { FC, useState } from 'react'

import { Button, IconSelector, Input, Modal, Text, Title } from '@delab-team/de-ui'

import s from './amount.module.scss'

interface AmountProps {
    value: string;
    onChange: ([ ...args ]: any) => void;
    selectedValue: string;
    handleSelect: ([ ...args ]: any) => void;
    options: {
        balance?: string;
        address: string[];
        value: string;
        label: string;
        decimals?: number;
        image?: string;
        description?: string | null;
        social?: string[] | null;
        websites?: string[] | null;
        catalogs?: string[] | null;
    }[];
    detailStyles?: boolean
    showBalanceToken?: boolean
    onlyRead?: boolean
    isTestnet: boolean,
    disabled?: boolean
}

const amountModalTg = { modalContent: { background: 'var(--tg-theme-bg-color)' }, closeButton: { color: 'var(--tg-theme-text-color)' } }
const textModalTg = { color: 'var(--tg-theme-text-color)' }

export const Amount: FC<AmountProps> = ({
    value,
    onChange,
    selectedValue,
    handleSelect,
    detailStyles = false,
    isTestnet,
    onlyRead = false,
    options,
    showBalanceToken,
    disabled = false
}) => {
    const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    console.log('disabled', disabled)

    return (
        <div className={s.inner}>
            <Input
                value={value}
                onChange={onChange}
                variant="black"
                className={`input ${s.input} ${onlyRead ? s.inputDisabled : ''}`}
                placeholder="Amount"
                tgStyles={{
                    input: {
                        background: 'var(--tg-theme-bg-color)',
                        color: 'var(--tg-theme-text-color)',
                        border: !detailStyles ? 'none' : '1px solid #B7B7BB'
                    }
                }}
            />
            <Button tgStyles={textModalTg} className={s.selectBtn} onClick={() => {
                if (!disabled) handleOpenModal()
            }}>
                {selectedValue}
                <IconSelector id="chevron-down" color='#fff' size="17px" tgStyles={{ stroke: 'var(--tg-theme-link-color)' }} />
            </Button>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className={s.modal} tgStyles={amountModalTg}>
                <Title variant="h6" className={s.tokenTitle} tgStyles={textModalTg}>
                    Select Token
                </Title>
                <div className={s.jettons}>
                    {options.map(el => (
                        <Button
                            className={s.btnSelect}
                            key={el.label}
                            onClick={() => {
                                handleSelect(
                                    {
                                        token: el.label,
                                        tokenAddress: el.address[Number(isTestnet)]
                                    }
                                )
                                setIsModalOpen(false)
                            }}
                            tgStyles={textModalTg}
                        >
                            <div className={s.selectInfo}>
                                <img src={el.image} alt={el.label} width={20} height={20} />
                                {showBalanceToken && <Text tgStyles={textModalTg}>{el.balance}</Text>}
                                <Text className={s.selectInfoLabel} tgStyles={textModalTg}>{el.label}</Text>
                            </div>
                            {selectedValue === el.label && <IconSelector id="check" color='#fff' size="20px" tgStyles={{ stroke: 'var(--tg-theme-link-color)' }} />}
                        </Button>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
