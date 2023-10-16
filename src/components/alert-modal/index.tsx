import { FC } from 'react'
import { Modal, Title } from '@delab-team/de-ui'

import s from './alert-modal.module.scss'

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    content: React.ReactNode | React.ReactNode[]
}

export const AlertModal: FC<AlertModalProps> = ({
    isOpen,
    onClose,
    content
}) => (
    <Modal isOpen={isOpen} onClose={onClose} className={s.alertModal}>
        <div className={s.alertModalHeader}>
            <div className={s.alertModalIcon}>
                <i>✔</i>
            </div>
        </div>
        <Title variant='h3' className={s.alertModalTitle}>Awesome!</Title>
        <div className={s.alertModalContent}>
            {content}
        </div>
    </Modal>
)
