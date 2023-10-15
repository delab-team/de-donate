/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable no-useless-return */
/* eslint-disable spaced-comment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from 'react'
import { Button, FileUpload, Input, Spinner, Text, TextArea } from '@delab-team/de-ui'
import { useNavigate, useParams } from 'react-router-dom'

import { useTonAddress } from '@tonconnect/ui-react'
import { CustomIpfs } from '../../logic/ipfs'

import { Items, TonApi } from '../../logic/tonapi'

import s from './fundraiser-update.module.scss'

interface FundraiserUpdateProps {}

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

export const FundraiserUpdate: FC<FundraiserUpdateProps> = () => {
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

    //========================================================================================================================================================

    useEffect(() => {
        if (!first || rawAddress) {
            if (!id || !rawAddress) {
                return
            }
            setFirst(true)

            const coll = 'kQCCcr1oWJ5XcMTgPn2HsAFIpvb_3C1YATFI6wrB57nEWgkb'

            const api = new TonApi('testnet')

            api.getItemsV2(coll).then(async (items: Items | undefined) => {
                if (items) {
                    for (let i = 0; i < items.nft_items.length; i++) {
                        const addressFund = id

                        if (addressFund === items.nft_items[i].address) {
                            const isOwnFund = rawAddress === items.nft_items[i].owner?.address

                            if (addressFund === undefined) {
                                return
                            }

                            if (!isOwnFund) {
                                return navigate('/')
                            }

                            const fund = {
                                title: items.nft_items[i].metadata.name ?? 'Not name',
                                img: items.nft_items[i].metadata.image?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') ?? '',
                                description: items.nft_items[i].metadata.description || '',
                                ownerAddress: items.nft_items[i].owner?.address,
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
                    }
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
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight > 120 ? '120px' : textarea.scrollHeight + 'px'
        setUpdateData({
            ...updateData,
            description: e.target.value
        })
    }

    return (
        <div>
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
                />
                <TextArea
                    value={updateData.description}
                    onChange={handleTextareaChange}
                    variant="black"
                    className="input"
                    placeholder="Description"
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
                    {img.length < 1 && !uploading && <Text className={s.fileText}>Maximum allowed size: 440 x 150 (10 MB)</Text>}
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
