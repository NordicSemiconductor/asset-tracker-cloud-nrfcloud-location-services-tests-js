import {
	AGNSSMessage,
	SCHEMA_VERSION,
	verify,
} from '../src/verify-agnss-data.js'
import { apiClient, tokenAuthorization } from './api-client.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { getBinary, head } = apiClient({
	endpoint: process.env.API_HOST,
	authorizationToken: tokenAuthorization({
		tokenKey: process.env.AGNSS_SERVICE_KEY ?? '',
		tokenPayload: {
			aud: process.env.TEAM_ID,
		},
	}),
})

void describe('AGNSS', () => {
	void describe('chunking', () => {
		void describe('use HEAD request to get response size', () => {
			const agnssReq = {
				deviceIdentifier: 'TestClient',
				mcc: 242,
				mnc: 2,
				eci: 33703712,
				tac: 2305,
				requestType: 'rtAssistance',
			}
			let chunkSize: number

			void it('should describe length of A-GNSS data', async () => {
				const res = await head({
					resource: 'location/agnss',
					payload: agnssReq,
				})
				chunkSize = parseInt(res.get('content-length') ?? '0', 10)
				assert.equal(chunkSize > 0, true)
			})

			void it('should return A-GNSS data', async () => {
				assert.equal(chunkSize > 0, true) // chunk size should have been set
				const res = await getBinary({
					resource: 'location/agnss',
					payload: agnssReq,
					headers: {
						'Content-Type': 'application/octet-stream',
						Range: `bytes=0-${chunkSize}`,
					},
				})
				assert.equal(res.length, chunkSize)

				// Verify response
				const verified = verify(res)
				assert.equal('error' in verified, false)
				assert.equal((verified as AGNSSMessage).schemaVersion, SCHEMA_VERSION)
			})

			void it('should chunk large responses', async () => {
				const res = await getBinary({
					resource: 'location/agnss',
					payload: {
						mcc: 242,
						mnc: 2,
						eci: 33703712,
						tac: 2305,
						requestType: 'custom',
						customTypes: 2,
					},
					headers: {
						'Content-Type': 'application/octet-stream',
						Range: `bytes=0-2000`,
					},
				})
				assert.equal(res.length < 2000, true)

				// Verify response
				const verified = verify(res)
				assert.equal('error' in verified, false)
				assert.equal((verified as AGNSSMessage).schemaVersion, SCHEMA_VERSION)
				assert.equal((verified as AGNSSMessage).entries.length, 1)
				assert.equal((verified as AGNSSMessage).entries[0].type, 2)
				assert.equal((verified as AGNSSMessage).entries[0].items > 0, true)
			})
		})
	})

	void describe('should support 8 types', () => {
		for (const type of [1, 2, 3, 4, 6, 7, 8, 9]) {
			void it(`should resolve custom type ${type}`, async () => {
				const agnssReq = {
					mcc: 242,
					mnc: 2,
					eci: 33703712,
					tac: 2305,
					requestType: 'custom',
					customTypes: type,
				}

				const headRes = await head({
					resource: 'location/agnss',
					payload: agnssReq,
				})
				const chunkSize = parseInt(headRes.get('content-length') ?? '0', 10)
				assert.equal(chunkSize > 0, true)

				const res = await getBinary({
					resource: 'location/agnss',
					payload: agnssReq,
					headers: {
						'Content-Type': 'application/octet-stream',
						Range: `bytes=0-${chunkSize}`,
					},
				})
				assert.equal(res.length, chunkSize)

				// Verify response
				const verified = verify(res)
				assert.equal('error' in verified, false)
				assert.equal((verified as AGNSSMessage).schemaVersion, SCHEMA_VERSION)
				assert.equal((verified as AGNSSMessage).entries.length, 1)
				assert.equal((verified as AGNSSMessage).entries[0].type, type)
				assert.equal((verified as AGNSSMessage).entries[0].items > 0, true)
			})
		}
	})

	void it('should combine types', async () => {
		const types = new Set([1, 3, 4, 6, 7, 8, 9])
		const agnssReq = {
			mcc: 242,
			mnc: 2,
			eci: 33703712,
			tac: 2305,
			requestType: 'custom',
			customTypes: [...types],
		}

		const headRes = await head({
			resource: 'location/agnss',
			payload: agnssReq,
		})
		const chunkSize = parseInt(headRes.get('content-length') ?? '0', 10)
		assert.equal(chunkSize > 0, true)

		const res = await getBinary({
			resource: 'location/agnss',
			payload: agnssReq,
			headers: {
				'Content-Type': 'application/octet-stream',
				Range: `bytes=0-${chunkSize}`,
			},
		})
		assert.equal(res.length, chunkSize)

		// Verify response
		const verified = verify(res)
		assert.equal('error' in verified, false)
		assert.equal((verified as AGNSSMessage).schemaVersion, SCHEMA_VERSION)
		assert.equal((verified as AGNSSMessage).entries.length, 7)
		assert.deepEqual(
			new Set((verified as AGNSSMessage).entries.map(({ type }) => type)),
			types,
		)
	})
})
