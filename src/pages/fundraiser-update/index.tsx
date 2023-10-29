/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable no-useless-return */
/* eslint-disable spaced-comment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from 'react'
import { Button, FileUpload, Input, Spinner, Text, TextArea, Title } from '@delab-team/de-ui'
import { useNavigate, useParams } from 'react-router-dom'

import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { CustomIpfs } from '../../logic/ipfs'

import { Item, Items, TonApi } from '../../logic/tonapi'

import s from './fundraiser-update.module.scss'
import { Smart } from '../../logic/smart'

interface FundraiserUpdateProps {
    isTestnet: boolean
}

type FundraiserUpdateDataType = {
    title: string;
    description: string;
    img: string;
}

type FundType = {
    title: string;
    description: string;
    img: string,
    ownerAddress: string | undefined;
    addressFund: string;
}

const titleTgStyles = { color: 'var(--tg-theme-text-color)' }
const inputTgStyles = { background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }
const fileTextTg = { color: 'var(--tg-theme-text-color)' }
const fileUploadTg = { icon: { fill: 'var(--tg-theme-link-color)' }, uploadText: { color: 'var(--tg-theme-text-color)' }, uploadContainer: { border: '3px dashed #B7B7BB' } }

export const FundraiserUpdate: FC<FundraiserUpdateProps> = ({ isTestnet }) => {
    const { id } = useParams()

    const [ first, setFirst ] = useState<boolean>(false)

    // Cтарая дата фунда

    const [ fundData, setFundData ] = useState<FundType>({
        title: '',
        description: '',
        img: '',
        addressFund: '',
        ownerAddress: ''
    })

    const navigate = useNavigate()

    const [ img, setImg ] = useState<string>('')

    const [ error, setError ] = useState<boolean>(false)

    const [ uploading, setUploading ] = useState<boolean>(false)

    const [ updateLoading, setUpdateLoading ] = useState<boolean>(false)

    // Новые данные фунда

    const [ updateData, setUpdateData ] = useState<FundraiserUpdateDataType>({
        title: '',
        description: '',
        img: ''
    })

    const rawAddress = useTonAddress(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    //========================================================================================================================================================

    useEffect(() => {
        if (!first || rawAddress) {
            if (!id || !rawAddress) {
                return
            }
            setFirst(true)

            const api = new TonApi(isTestnet ? 'testnet' : 'mainnet')

            const smart = new Smart(tonConnectUI, isTestnet)

            api.getItemV2(id).then(async (item: Item | undefined) => {
                if (item) {
                    const addressFund = id

                    const isOwnFund = rawAddress === item.owner?.address

                    if (addressFund === undefined) {
                        return
                    }

                    if (!isOwnFund) {
                        return navigate('/')
                    }

                    const promise = Promise.all([
                        smart.getJsonNft(addressFund)
                    ])

                    const [ metadata ] = await promise

                    const fund = {
                        title: item.metadata.name ?? (metadata?.name ?? 'Not name'),
                        img: item.metadata.image?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? metadata?.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
                        description: item.metadata.description ?? metadata?.description ?? '',
                        ownerAddress: item.owner?.address,
                        addressFund
                    }

                    setFundData(fund)

                    setUpdateData({
                        title: fund.title,
                        description: fund.description || '',
                        img: fund.img
                    })

                    const imgLink = fund.img.replace('https://cloudflare-ipfs.com/ipfs', '')

                    setImg(imgLink)
                }
            })
        }

        return () => {
            setFundData({
                title: '',
                description: '',
                img: '',
                ownerAddress: '',
                addressFund: ''
            })
        }
    }, [ id, rawAddress ])

    //=======================================================================================================================================================

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

    // Обновить фунд

    async function updateFundraiser () {
        setUpdateLoading(true)
        const ipfs = new CustomIpfs()

        const metadata = {
            image: img,
            description: updateData.description,
            name: updateData.title,
            marketplace: 'dedonate.com'
        }

        const ipfsData = await ipfs.uploadDataJson(JSON.stringify(metadata))
        if (!ipfsData) {
            return
        }

        const data = { content: `ipfs://${ipfsData}/metadata.json` }

        setUpdateData({
            ...updateData,
            img: data.content
        })

        setUpdateLoading(false)
    }

    //========================================================================================================================================================

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdateData({
            ...updateData,
            description: e.target.value
        })
    }

    return (
        <div>
            <Title variant='h2' className={s.title} tgStyles={titleTgStyles}>Update fundraiser </Title>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} className={s.form}>
                <Input
                    value={updateData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUpdateData({
                            ...updateData,
                            title: e.target.value
                        })
                    }}
                    variant="black"
                    className="input"
                    placeholder="Name"
                    tgStyles={{ input: inputTgStyles }}
                />
                <TextArea
                    value={updateData.description}
                    onChange={handleTextareaChange}
                    variant="black"
                    className={`input ${s.textarea}`}
                    placeholder="Description"
                    tgStyles={inputTgStyles}
                />
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
                                        uploadText="Upload Image"
                                        tgStyles={fileUploadTg}
                                    />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={s.fileInner}>
                            <Button
                                variant="danger"
                                className={s.clearImages}
                                onClick={() => {
                                    setUpdateData({
                                        ...updateData,
                                        img: ''
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
                    {img.length < 1 && !uploading && <Text className={s.fileText} tgStyles={fileTextTg}>Maximum allowed size: 440 x 150 (10 MB)</Text>}
                </div>
                <Button
                    rounded="l"
                    size="stretched"
                    className="action-btn"
                    onClick={() => updateFundraiser()}
                    loading={updateLoading}
                    disabled={
                        updateData.title.length < 1
                        || updateData.description.length < 1
                        || img.length < 2
                    }
                >
                    Update
                </Button>
            </form>
        </div>
    )
}
