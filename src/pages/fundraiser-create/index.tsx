/* eslint-disable no-useless-return */
/* eslint-disable max-len */
/* eslint-disable spaced-comment */
import { FC, useState } from 'react'
import { Button, Title, Input, Text, FileUpload, Spinner, Alert } from '@delab-team/de-ui'

import { jettons } from '../../constants/jettons'
import { Amount } from '../../components/amount'

import s from './fundraiser-create.module.scss'
import { CustomIpfs } from '../../logic/ipfs'

interface FundraiserCreateProps {}

type FundraiserCreateDataType = {
    name: string;
    description: string;
    amount: number | string;
    timeLife: number;
    token: string;
    file: string;
}

export const FundraiserCreate: FC<FundraiserCreateProps> = () => {
    const [ activeTimeLife, setActiveTimeLife ] = useState<number>(7)

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const [ img, setImg ] = useState<string>('')

    const [ uploading, setUploading ] = useState<boolean>(false)
    const [ error, setError ] = useState<boolean>(false)

    const [ createData, setCreateData ] = useState<FundraiserCreateDataType>({
        name: '',
        description: '',
        amount: '',
        token: 'TOH',
        timeLife: 7,
        file: ''
    })

    async function uploadImg (e: any): Promise<any> {
        const file = e.target.files?.[0]
        if (!file) {
            return null
        }

        const maxFileSizeBytes = 10 * 1024 * 1024

        if (file.size > maxFileSizeBytes) {
            setError(true)
        }

        const url = await CustomIpfs.infuraUploadImg(file)
        return url || null
    }

    const handleFileChange = async (e: any) => {
        setUploading(true)
        const url = await uploadImg(e)
        setUploading(false)
        if (url !== null) {
            setImg(url)
        }
    }

    //========================================================================================================================================================

    // Create fundraiser

    async function createFundraiser () {
        const ipfs = new CustomIpfs()

        const metadata = {
            image: 'ipfs://',
            description: '',
            name: '',
            marketplace: 'dedonate.com'
        }

        const ipfsData = await ipfs.uploadDataJson(JSON.stringify(metadata))
        if (!ipfsData) {
            return
        }

        const data = {
            // content: Buffer.from(`ipfs://${ipfsData}`, 'utf8').toString('base64'),
            content: `ipfs://${ipfsData}/metadata.json`
        }

        setCreateData({
            ...createData,
            file: data.content
        })

        console.log('🚀 ~ file: index.tsx:88 ~ createFundraiser ~ data:', data)
    }

    //========================================================================================================================================================

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

    //========================================================================================================================================================

    return (
        <div className={s.inner}>
            {error && (
                <Alert
                    type="important"
                    onClose={() => setError(false)}
                    icon={<span>🚀</span>}
                    autoCloseTimeout={5000}
                    position="top-right"
                    className={s.alert}
                >
                    <div className="alert-text">
                        The file is too large. Maximum allowed size: 10 MB
                    </div>
                </Alert>
            )}
            <Title variant="h1" customClassName={s.title} color="#fff">
                Create fundraiser
            </Title>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
                <div className={s.innerInputs}>
                    <Input
                        value={createData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                name: e.target.value
                            })
                        }}
                        variant="black"
                        className="input"
                        placeholder="Name"
                    />
                    <Input
                        value={createData.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                description: e.target.value
                            })
                        }}
                        variant="black"
                        className="input"
                        placeholder="Description"
                    />
                </div>
                <div className={s.amount}>
                    <Amount
                        options={jettons}
                        value={String(createData.amount)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateData({
                                ...createData,
                                amount: Number(e.target.value)
                            })
                        }}
                        selectedValue={selectedValue}
                        handleSelect={handleSelect}
                    />
                </div>
                <div>
                    <Text customClassName={s.timeLifeTitle} fontSize="small">
                        Time life fundraiser
                    </Text>
                    <div className={s.timeLifeItems}>
                        <div
                            className={`${s.timeLifeItem} ${
                                activeTimeLife === 7 ? s.activeLifeItem : ''
                            }`}
                            onClick={() => handleTimeClick(7)}
                        >
                            7 day
                        </div>
                        <div
                            className={`${s.timeLifeItem} ${
                                activeTimeLife === 14 ? s.activeLifeItem : ''
                            }`}
                            onClick={() => handleTimeClick(14)}
                        >
                            14 day
                        </div>
                        <div
                            className={`${s.timeLifeItem} ${
                                activeTimeLife === 30 ? s.activeLifeItem : ''
                            }`}
                            onClick={() => handleTimeClick(30)}
                        >
                            30 day
                        </div>
                    </div>
                </div>
                <div className={s.fileData}>
                    {img.length < 1 ? (
                        <>
                            {uploading ? (
                                <div className={s.spinner}>
                                    <Spinner />
                                </div>
                            ) : (
                                <button onChange={handleFileChange} className={s.fileBtn}>
                                    <FileUpload
                                        onFileUpload={() => {}}
                                        accept=".jpg, .jpeg, .png"
                                        className={s.fileUpload}
                                        uploadText="Upload Image"  />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={s.fileInner}>
                            <Button
                                variant="danger"
                                className={s.clearImages}
                                onClick={() => {
                                    setCreateData({
                                        ...createData,
                                        file: ''
                                    })
                                    setImg('')
                                }}
                            >
                                X
                            </Button>
                            <img
                                src={`https://cloudflare-ipfs.com/ipfs/${img}`}
                                alt="Downloaded"
                                style={{ maxWidth: '100%' }}
                            />
                        </div>
                    )}
                </div>
                <Button
                    rounded="l"
                    size="stretched"
                    className="action-btn"
                    onClick={() => createFundraiser()}
                    disabled={
                        createData.name.length < 1
                        || createData.description.length < 1
                        || Number(createData.amount) < 0.00001
                        || img.length < 2
                    }
                >
                    Create
                </Button>
            </form>
        </div>
    )
}
