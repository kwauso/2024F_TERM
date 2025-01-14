import { createAgent, IResolver } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { 
  DataStore,
  DataStoreORM,
  DIDStore, 
  Entities,
  KeyStore,
  PrivateKeyStore,
  migrations
} from '@veramo/data-store'
import { DataSource } from 'typeorm'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// データベースファイルのパスを設定
const DATABASE_FILE = path.join(__dirname, '../../database/database.sqlite')

// 秘密鍵の暗号化に使用するシークレット
const KMS_SECRET_KEY = process.env.KMS_SECRET_KEY || '0000000000000000000000000000000000000000000000000000000000000000'

// SQLiteデータベースの設定
const dbConnection = new DataSource({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
})

// データベース接続の初期化
export const initializeAgent = async () => {
  try {
    await dbConnection.initialize()
    console.log('Database connection initialized')
    
    const secretBox = new SecretBox(KMS_SECRET_KEY)
    
    return createAgent<IResolver & ICredentialIssuer>({
      plugins: [
        new KeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, secretBox)),
          },
        }),
        new DIDManager({
          store: new DIDStore(dbConnection),
          defaultProvider: 'did:web',
          providers: {
            'did:web': new WebDIDProvider({
              defaultKms: 'local',
            }),
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...webDidResolver()
          }),
        }),
        new CredentialIssuer(),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
      ],
    })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}