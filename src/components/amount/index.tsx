/* eslint-disable max-len */
import { FC, useState } from 'react'

import { Button, IconSelector, Input, Modal, Text, Title } from '@delab-team/de-ui'

import { jettons } from '../../constants/jettons'

import s from './amount.module.scss'

interface AmountProps {
    value: string;
    onChange: ([ ...args ]: any) => void;
    selectedValue: string;
    handleSelect: ([ ...args ]: any) => void;
    options: {
        address?: null | string;
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
}

const amountModalTg = { modalContent: { background: '#fff' }, closeButton: { color: '#000' } }
const textModalTg = { color: '#000' }

export const Amount: FC<AmountProps> = ({
    value,
    onChange,
    selectedValue,
    handleSelect,
    detailStyles = false
}) => {
    const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div className={s.inner}>
            <Input
                value={value}
                onChange={onChange}
                variant="black"
                className={`input ${s.input}`}
                placeholder="Amount"
                tgStyles={{
                    input: {
                        background: '#FFF',
                        color: '#000',
                        border: !detailStyles ? 'none' : '1px solid #B7B7BB'
                    }
                }}
            />
            <Button tgStyles={textModalTg} className={s.selectBtn} onClick={handleOpenModal}>
                {selectedValue}
                <IconSelector id="chevron-down" color='#fff' size="17px" tgStyles={{ stroke: '#000' }} />
            </Button>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className={s.modal} tgStyles={amountModalTg}>
                <Title variant="h6" className={s.tokenTitle} tgStyles={textModalTg}>
                    Select Token
                </Title>
                <div className={s.jettons}>
                    {jettons.map(el => (
                        <Button
                            className={s.btnSelect}
                            key={el.label}
                            onClick={() => {
                                handleSelect(el.label)
                                setIsModalOpen(false)
                            }}
                            tgStyles={textModalTg}
                        >
                            <div className={s.selectInfo}>
                                <img src={el.image} alt={el.label} width={20} height={20} />
                                <Text className={s.selectInfoLabel} tgStyles={textModalTg}>{el.label}</Text>
                            </div>
                            {selectedValue === el.label && <IconSelector id="check" color='#fff' size="20px" tgStyles={{ stroke: '#000' }} />}
                        </Button>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
