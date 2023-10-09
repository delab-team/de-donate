/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react'
import { Button, FileUpload, FileUploadProps, Input } from '@delab-team/de-ui'

import s from './fundraiser-update.module.scss'

interface FundraiserUpdateProps {
}

type FundraiserUpdateDataType = {
    name: string;
    description: string;
    file: null | File;
}

export const FundraiserUpdate: FC<FundraiserUpdateProps> = () => {
    const [ uploadedFile, setUploadedFile ] = useState<File | null>(null)

    const [ updateData, setUpdateData ] = useState<FundraiserUpdateDataType>({
        name: '',
        description: '',
        file: null
    })

    const handleFileUpload: FileUploadProps['onFileUpload'] = (file) => {
        setUploadedFile(file)

        setUpdateData({
            ...updateData,
            file
        })
    }

    return (
        <div>
            <form onSubmit={() => {}} className={s.form}>
                <Input
                    value={updateData.name}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            setUpdateData({
                                ...updateData,
                                name: e.target.value
                            })
                        }
                    }
                    variant="black"
                    className="input"
                    placeholder="Name"
                />
                <Input
                    value={updateData.description}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            setUpdateData({
                                ...updateData,
                                description: e.target.value
                            })
                        }
                    }
                    variant="black"
                    className="input"
                    placeholder="Description"
                />
                <div className={s.fileData}>
                    {!updateData.file ? (
                        <FileUpload
                            onFileUpload={handleFileUpload}
                            accept=".jpg, .jpeg, .png"
                            className={s.fileUpload}
                            variant='white'
                            uploadText="Upload Image"  />
                    ) : (
                        <div className={s.fileInner}>
                            <Button
                                variant='danger'
                                className={s.clearImages}
                                onClick={() => setUpdateData({
                                    ...updateData,
                                    file: null
                                })}
                            >X</Button>
                            <img
                                src={URL.createObjectURL(updateData.file)}
                                alt="Downloaded"
                                style={{ maxWidth: '100%' }}
                            />
                        </div>
                    )}
                </div>
                <Button rounded="l" size="stretched" className="action-btn" type="submit">Update</Button>
            </form>
        </div>
    )
}
