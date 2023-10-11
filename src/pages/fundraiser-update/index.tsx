/* eslint-disable no-useless-return */
/* eslint-disable spaced-comment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react'
import { Button, FileUpload, FileUploadProps, Input, Spinner, TextArea } from '@delab-team/de-ui'

import { CustomIpfs } from '../../logic/ipfs'

import s from './fundraiser-update.module.scss'

interface FundraiserUpdateProps {}

type FundraiserUpdateDataType = {
    name: string;
    description: string;
    file: string;
}

export const FundraiserUpdate: FC<FundraiserUpdateProps> = () => {
    const [ uploadedFile, setUploadedFile ] = useState<File | null>(null)

    const [ img, setImg ] = useState<string>('')

    const [ error, setError ] = useState<boolean>(false)

    const [ uploading, setUploading ] = useState<boolean>(false)

    const [ updateLoading, setUpdateLoading ] = useState<boolean>(false)

    const [ updateData, setUpdateData ] = useState<FundraiserUpdateDataType>({
        name: '',
        description: '',
        file: ''
    })
    console.log('🚀 ~ file: index.tsx:23 ~ updateData:', updateData)

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

    // Update fundraiser

    async function updateFundraiser () {
        setUpdateLoading(true)
        const ipfs = new CustomIpfs()

        const metadata = {
            image: img,
            description: updateData.description,
            name: updateData.name,
            marketplace: 'dedonate.com'
        }

        const ipfsData = await ipfs.uploadDataJson(JSON.stringify(metadata))
        if (!ipfsData) {
            return
        }

        const data = { content: `ipfs://${ipfsData}/metadata.json` }

        setUpdateData({
            ...updateData,
            file: data.content
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
                    value={updateData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUpdateData({
                            ...updateData,
                            name: e.target.value
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
                    onClick={() => updateFundraiser()}
                    loading={updateLoading}
                    disabled={
                        updateData.name.length < 1
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
