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
}

export const Amount: FC<AmountProps> = ({
    value,
    onChange,
    selectedValue,
    handleSelect
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
                type="number"
                value={value}
                onChange={onChange}
                variant="black"
                className={`input ${s.input}`}
                placeholder="Amount"
            />
            <Button className={s.selectBtn} onClick={handleOpenModal}>
                {selectedValue}
                <IconSelector id="chevron-down" size="17px" />
            </Button>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className={s.modal}>
                <Title variant="h6" customClassName={s.tokenTitle}>
                    Select Token
                </Title>
                <div className={s.jettons}>
                    {jettons.map(el => (
                        <Button
                            className={s.btnSelect}
                            key={el.label}
                            onClick={() => handleSelect(el.label)}
                        >
                            <div className={s.selectInfo}>
                                <img src={el.image} alt={el.label} width={20} height={20} />
                                <Text>{el.label}</Text>
                            </div>
                            {selectedValue === el.label && <IconSelector id="check" size="20px" />}
                        </Button>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
