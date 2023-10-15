/* eslint-disable no-useless-return */
/* eslint-disable max-len */
/* eslint-disable spaced-comment */
import { FC, useState } from 'react'
import { Button, Title, Input, Text, FileUpload, Spinner, Alert, TextArea } from '@delab-team/de-ui'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'

import { Amount } from '../../components/amount'

import { jettons } from '../../constants/jettons'

import { CustomIpfs } from '../../logic/ipfs'
import { Smart } from '../../logic/smart'

import s from './fundraiser-create.module.scss'

interface FundraiserCreateProps {}

type FundraiserCreateDataType = {
    name: string;
    description: string;
    amount: string;
    timeLife: number;
    token: string;
    file: string;
}

export const FundraiserCreate: FC<FundraiserCreateProps> = () => {
    const [ activeTimeLife, setActiveTimeLife ] = useState<number>(7)

    const [ selectedValue, setSelectedValue ] = useState<string>(jettons[0].value)

    const [ img, setImg ] = useState<string>('')

    const [ error, setError ] = useState<boolean>(false)
    // Uploading the image Loading
    const [ uploading, setUploading ] = useState<boolean>(false)
    // Create the fundraiser Loading
    const [ createLoading, setCreateLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const RawAddress = useTonAddress()

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
        setCreateLoading(true)
        const ipfs = new CustomIpfs()

        const metadata = {
            image: `ipfs://${img}`,
            description: createData.description,
            name: createData.name,
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

        const addrColl = 'kQCCcr1oWJ5XcMTgPn2HsAFIpvb_3C1YATFI6wrB57nEWgkb'

        const smart = new Smart(tonConnectUI, true)

        // const createColl = await smart.deployDeployer('EQDYl5uFtd5O0EI19GLnMZPKPMtopdLlyvTexPmeJgkAAfq3', data.content)

        const addr = await smart.deployFundraiser(addrColl, data.content)
        console.log(addr?.toString())

        // if (String(addr)) {
        //     setCreateData({
        //         name: '',
        //         description: '',
        //         amount: '',
        //         token: 'TOH',
        //         timeLife: 7,
        //         file: ''
        //     })
        //     setImg('')
        // }

        setCreateLoading(false)
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

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = (textarea.scrollHeight > 120 ? '120px' : textarea.scrollHeight + 'px')
        setCreateData({
            ...createData,
            description: e.target.value
        })
    }

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
            <Title variant="h1" className={s.title} color="#fff">
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
                    <TextArea
                        value={createData.description}
                        onChange={handleTextareaChange
                        }
                        variant="black"
                        className="input textArea"
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
                                amount: e.target.value
                            })
                        }}
                        selectedValue={selectedValue}
                        handleSelect={handleSelect}
                    />
                </div>
                <div>
                    <Text className={s.timeLifeTitle} fontSize="small">
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
                                        variant='white'
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
                    loading={createLoading}
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
