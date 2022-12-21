import { spawn } from 'child_process'
import { randomUUID } from 'node:crypto'
import * as os from 'os'
import { apiClient, tokenAuthorization } from './api-client'

const endpoint = process.env.API_HOST

const apiKeyClient = apiClient({
	endpoint,
	authorizationToken: process.env.API_KEY as string,
})

describe('authenticate using device keys', () => {
	let privateKey: string
	let publicKey: string
	let deviceId: string
	let bulkOpsRequestId: string

	beforeAll(async () => {
		// Generate a globally uniqe device ID
		deviceId = randomUUID()

		// Generate a key for the device
		privateKey = await new Promise<string>((resolve, reject) => {
			const openssl = spawn('openssl', [
				'ecparam',
				'-name',
				'secp256k1',
				'-genkey',
			])
			const res: string[] = []
			const err: string[] = []
			openssl.stdout.on('data', (data) => {
				res.push(data)
			})

			openssl.stderr.on('data', (data) => {
				err.push(data)
			})

			openssl.on('close', (code) => {
				if (code !== 0) {
					return reject(err.join(os.EOL))
				}
				return resolve(res.join(os.EOL))
			})
		})

		publicKey = await new Promise<string>((resolve, reject) => {
			const openssl = spawn('openssl', ['ec', '-pubout', '-outform', 'pem'])
			openssl.stdin.write(privateKey)

			console.log(privateKey)

			const res: string[] = []
			const err: string[] = []
			openssl.stdout.on('data', (data) => {
				console.log(Buffer.from(data).toString())
				res.push(data)
			})

			openssl.stderr.on('data', (data) => {
				err.push(data)
			})

			openssl.on('close', (code) => {
				if (code !== 0) {
					return reject(err.join(os.EOL))
				}
				return resolve(res.join(os.EOL))
			})
		})
	})

	it('should register a new device key', async () => {
		const { bulkOpsRequestId: rid } = await apiKeyClient.postBinary({
			resource: 'devices/public-keys',
			payload: `${deviceId},"${publicKey}"`,
		})
		bulkOpsRequestId = rid
		expect(bulkOpsRequestId).not.toBeUndefined()
	})

	it('should process the request', async () => {
		const getStatus = async () =>
			apiKeyClient
				.getJSON({
					resource: `bulk-ops-requests/${bulkOpsRequestId}`,
				})
				.then(({ status }) => status)
		const status = await new Promise((resolve, reject) => {
			let t: NodeJS.Timeout | undefined = undefined
			const i = setInterval(async () => {
				const status = await getStatus()
				if (status !== 'PENDING') {
					clearInterval(i)
					if (t !== undefined) clearTimeout(t)
					resolve(status)
				}
			}, 1000)
			t = setTimeout(() => {
				clearInterval(i)
				reject(new Error(`Timeout`))
			}, 30000)
		})
		expect(status).toEqual('SUCCEEDED')
	})

	it('should accept the device-key based JWT', async () => {
		const { getJSON } = apiClient({
			endpoint,
			authorizationToken: tokenAuthorization({
				tokenKey: privateKey,
				tokenPayload: {
					sub: deviceId,
				},
			}),
		})
		const res = await getJSON<{ host: string; path: string }>({
			resource: 'location/pgps',
			payload: {
				predictionCount: 6,
				predictionIntervalMinutes: 120,
			},
		})
		expect(res.host).not.toBeUndefined()
		expect(res.path).not.toBeUndefined()
	})
})
