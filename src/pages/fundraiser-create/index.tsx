import { FC, useState } from 'react'
import { Button, Title, Input, Text, FileUpload, FileUploadProps } from '@delab-team/de-ui'

import { jettons } from '../../constants/jettons'
import { Amount } from '../../components/amount'

import s from './fundraiser-create.module.scss'

interface FundraiserCreateProps {}

type FundraiserCreateDataType = {
    name: string;
    description: string;
    amount: number | string;
    timeLife: number;
    token: string;
    file: null | File;
}

export const FundraiserCreate: FC<FundraiserCreateProps> = () => {
    const [ activeTimeLife, setActiveTimeLife ] = useState<number>(7)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ uploadedFile, setUploadedFile ] = useState<File | null>(null)

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const [ createData, setCreateData ] = useState<FundraiserCreateDataType>({
        name: '',
        description: '',
        amount: '',
        token: 'TOH',
        timeLife: 7,
        file: null
    })
    console.log('🚀 ~ file: index.tsx:29 ~ createData:', createData)

    const handleFileUpload: FileUploadProps['onFileUpload'] = (file) => {
        setUploadedFile(file)

        setCreateData({
            ...createData,
            file
        })
    }

    const handleTimeClick = (time: number) => {
        setActiveTimeLife(time)
        setCreateData({
            ...createData,
            timeLife: time
        })
    }

    const handleSelect = (value: string) => {
        setSelectedValue(value)
        setCreateData({
            ...createData,
            token: value
        })
    }

    return (<div className={s.inner}>
        <Title variant="h1" customClassName={s.title}>
        Top fundraiser
        </Title>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
            <div className={s.innerInputs}>
                <Input
                    value={createData.name}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                name: e.target.value
                            })
                        }
                    }
                    variant="black"
                    className="input"
                    placeholder="Name"
                />
                <Input
                    value={createData.description}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                description: e.target.value
                            })
                        }
                    }
                    variant="black"
                    className="input"
                    placeholder="Description"
                />
            </div>
            <div className={s.amount}>
                <Amount
                    options={jettons}
                    value={String(createData.amount)}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                amount: Number(e.target.value)
                            })
                        }
                    }
                    selectedValue={selectedValue}
                    handleSelect={handleSelect}
                />
            </div>
            <div>
                <Text customClassName={s.timeLifeTitle} fontSize='small'>Time life fundraiser</Text>
                <div className={s.timeLifeItems}>
                    <div
                        className={`${s.timeLifeItem} ${activeTimeLife === 7 ? s.activeLifeItem : ''}`}
                        onClick={() => handleTimeClick(7)}
                    >
                        7 day
                    </div>
                    <div
                        className={`${s.timeLifeItem} ${activeTimeLife === 14 ? s.activeLifeItem : ''}`}
                        onClick={() => handleTimeClick(14)}
                    >
                        14 day
                    </div>
                    <div
                        className={`${s.timeLifeItem} ${activeTimeLife === 30 ? s.activeLifeItem : ''}`}
                        onClick={() => handleTimeClick(30)}
                    >
                        30 day
                    </div>
                </div>
            </div>
            <div className={s.fileData}>
                {!createData.file ? (
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        accept=".jpg, .jpeg, .png"
                        className={s.fileUpload}
                        uploadText="Upload Image"  />
                ) : (
                    <div className={s.fileInner}>
                        <Button
                            variant='danger'
                            className={s.clearImages}
                            onClick={() => setCreateData({
                                ...createData,
                                file: null
                            })}
                        >X</Button>
                        <img
                            src={URL.createObjectURL(createData.file)}
                            alt="Downloaded"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                )}
            </div>
            <Button rounded="l" size="stretched" className="action-btn">Create</Button>
        </form>
    </div>
    )
}
