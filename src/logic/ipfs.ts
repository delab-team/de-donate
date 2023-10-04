/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable max-len */
import axios from 'axios'
import { create } from 'ipfs-http-client'

export class CustomIpfs {
    private _ApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEYxMTYzMmM5Y2QzNEU3RjY2OWIwNDEyRWJlOUNGNDBjQ0NmNjExQjUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NDcxNjAyNjA5NSwibmFtZSI6InRlc3QifQ.Q5u50rL-7I9FhKyd9hZ21i2eCDB0J3oI6wT-uZa2FA8'

    private _url = 'https://api.nft.storage'

    public async send (url: string, data: any): Promise<any | undefined> {
        const res = await axios.post(`${this._url}${url}`, data, {
            headers: {
                Authorization: `Bearer ${this._ApiKey}`,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (!res.data.ok) {
            console.error(res.data.result)
            return undefined
        }
        return res.data
    }

    public async uploadDataJson (data: any): Promise<string | undefined> {
        const res = await this.send('/store', { meta: data })

        console.log(res)
        return res.value.ipnft
    }

    public static async infuraUploadImg (file: any): Promise<string | undefined> {
        const projectId = '2PhM1nD1iRxa28QNXXE1ZOpC4Nr'
        const projectSecret = 'a3e0e635349b318dd6827d9e7bfd48e2'
        const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`

        const client = create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: { authorization: auth }
        })

        const maxFileSizeBytes = 10 * 1024 * 1024

        try {
            if (file.size > maxFileSizeBytes) {
                console.error('The file is too large. Maximum allowed size: 10 MB')
                return undefined
            }

            const added = await client.add(file)
            console.log(added)
            const hex = Buffer.from(added.cid['/']).toString('hex')
            const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`
            console.log('IPFS URI: ', url)
            return added.path
        } catch (error) {
            console.log('Error uploading file: ', error)
            return undefined
        }
    }
}
