import { FC, useState } from 'react'

import { Button, IconSelector, Input, Modal, Select, Title } from '@delab-team/de-ui'

import s from './amount.module.scss'

interface AmountProps {
    value: string;
    onChange: ([ ...args ]: any) => void;
    selectedValue: string;
    handleSelect: ([ ...args ]: any) => void;
    options: {
        value: string;
        label: string;
    }[]
}

export const Amount: FC<AmountProps> = ({ value, onChange, selectedValue, handleSelect, options }) => {
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
                placeholder='Amount'
            />
            <Button className={s.selectBtn} onClick={handleOpenModal}>
                {selectedValue}
                <IconSelector id="chevron-down" size="17px" />
            </Button>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className={s.modal}>
                <Title variant="h6" customClassName={s.tokenTitle}>Select Token</Title>
                <Select
                    options={options}
                    selectedValue={selectedValue}
                    onSelect={handleSelect}
                    className={s.select}
                    variant="black"
                />
            </Modal>
        </div>
    )
}
