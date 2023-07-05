import FormData from 'form-data'
import { v4 as uuidv4 } from 'uuid'
const axios = require('axios').default

interface Response {
    error: boolean
    message?: string
    data?: any
}

export default class Uploader {
    private CF_ACCOUNT_ID: any
    private CF_API_TOKEN: any

    constructor(CF_ACCOUNT_ID: string, CF_API_TOKEN: string) {
        if (!(CF_ACCOUNT_ID && CF_API_TOKEN))
            throw new Error('CF_ACCOUNT_ID or CF_API_TOKEN cannot be empty')
        this.CF_ACCOUNT_ID = CF_ACCOUNT_ID
        this.CF_API_TOKEN = CF_API_TOKEN
    }

    public fromBase64 = async (
        base64Text: string,
        filename: string = uuidv4(),
        fileExtension: string = 'png'
    ): Promise<Response> => {
        return await new Promise(async (resolve, reject) => {
            try {
                if (!base64Text) {
                    throw new Error('base64Text cannot be empty')
                }
                if (base64Text.includes('base64')) {
                    throw new Error(
                        'Remove data:***/***;base64 tag from input.'
                    )
                }

                const formData = new FormData()
                formData.append(
                    'file',
                    Buffer.from(base64Text, 'base64'),
                    `${filename}.${fileExtension}`
                )

                const _data = await this.sendRequest(formData)
                resolve({
                    error: false,
                    data: _data,
                })
            } catch (err) {
                reject({
                    error: true,
                    message: err?.toString(),
                })
            }
        })
    }
    private sendRequest = async (formData: any) => {
        const options = {
            method: 'POST',
            url: `https://api.cloudflare.com/client/v4/accounts/${this.CF_ACCOUNT_ID}/images/v1`,
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${this.CF_API_TOKEN}`,
            },
            data: formData,
        }
        return (await axios.request(options))?.data
    }

    public fromURL = async (url: string): Promise<Response> => {
        return await new Promise(async (resolve, reject) => {
            try {
                if (!url) {
                    throw new Error('url cannot be empty')
                }
                const formData = new FormData()
                formData.append('url', url)
                const _data = await this.sendRequest(formData)
                resolve({
                    error: false,
                    data: _data,
                })
            } catch (err) {
                reject({
                    error: true,
                    message: err?.toString(),
                })
            }
        })
    }
}
