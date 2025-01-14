import { ICredentialIssuer } from '@veramo/core'
import { CreateVCParams } from '../types/credentials'

export class VCService {
  constructor(private agent: ICredentialIssuer) {}

  async createVC(params: CreateVCParams) {
    try {
      const credential = await this.agent.createVerifiableCredential({
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', ...params.types],
          issuer: { id: params.issuer },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: params.subject,
            ...params.claims
          }
        },
        proofFormat: 'jwt'
      })
      return credential
    } catch (error) {
      console.error('Error creating VC:', error)
      throw error
    }
  }
} 