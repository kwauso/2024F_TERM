export interface CredentialSubject {
  id: string
  [x: string]: any
}

export interface CredentialPayload {
  '@context': string[]
  type: string[]
  issuer: { id: string }
  issuanceDate: string
  credentialSubject: CredentialSubject
}

export interface PrimaryCredentialClaims {
  name: string
  age: number
  [x: string]: any
}

export interface SecondaryCredentialClaims {
  relatedCredentialId: string
  additionalInfo: string
  [x: string]: any
}

export interface CreateVCParams {
  issuer: string
  subject: string
  claims: PrimaryCredentialClaims | SecondaryCredentialClaims
  types: string[]
} 