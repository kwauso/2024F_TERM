import { ICredentialIssuer, W3CCredential } from '@veramo/core'

export class VPService {
  constructor(private agent: ICredentialIssuer) {}

  async createVP(credentials: W3CCredential[], holder: string) {
    try {
      const vp = await this.agent.createVerifiablePresentation({
        presentation: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: credentials,
          holder: { id: holder }
        },
        proofFormat: 'jwt'
      })
      return vp
    } catch (error) {
      console.error('Error creating VP:', error)
      throw error
    }
  }
} 