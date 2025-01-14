# 2024F_TERM
# Veramo DID/VC Demo

Veramoを使用してDID（Decentralized Identifier）とVC（Verifiable Credential）を発行・管理するデモアプリケーション。

## セットアップ

### 1. 必要なパッケージのインストール
```bash
pnpm install
```

### 2. 環境変数の設定
`.env`ファイルを作成し、以下の内容を設定:
```env
KMS_SECRET_KEY=your-very-secure-secret-key-min-32-chars
```

### 3. サーバーの起動
```bash
pnpm start
```

## APIエンドポイント

### 1. DIDの操作

#### DIDの発行
```bash
curl -X POST http://localhost:3000/did \
-H "Content-Type: application/json" \
-d '{
  "alias": "example"
}'
```

**レスポンス例:**
```json
{
  "did": "did:web:example",
  "controllerKeyId": "xxx",
  "provider": "did:web",
  "alias": "example",
  "keys": [...]
}
```

#### すべてのDIDの取得
```bash
curl http://localhost:3000/dids
```

#### 特定のDIDの取得
```bash
curl http://localhost:3000/did/did:web:example
```

### 2. VCとVPの操作

#### リンクされたVCの発行とVPの作成
```bash
curl -X POST http://localhost:3000/credentials/linked \
-H "Content-Type: application/json" \
-d '{
  "issuer": "did:web:example",
  "subject": "did:web:example",
  "holder": "did:web:example",
  "primaryClaims": {
    "name": "Alice",
    "age": 25
  },
  "secondaryClaims": {
    "additionalInfo": "Additional information about Alice"
  }
}'
```

**レスポンス例:**
```json
{
  "primaryVC": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "PrimaryCredential"],
    "issuer": {"id": "did:web:example"},
    "credentialSubject": {
      "id": "did:web:example",
      "name": "Alice",
      "age": 25
    },
    "proof": {...}
  },
  "secondaryVC": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "SecondaryCredential"],
    "issuer": {"id": "did:web:example"},
    "credentialSubject": {
      "id": "did:web:example",
      "relatedCredentialId": "jwt...",
      "additionalInfo": "Additional information about Alice"
    },
    "proof": {...}
  },
  "verifiablePresentation": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiablePresentation"],
    "holder": {"id": "did:web:example"},
    "verifiableCredential": [...],
    "proof": {...}
  }
}
```

## 使用例シナリオ

### 1. DIDの発行と確認
```bash
# DIDの発行
curl -X POST http://localhost:3000/did \
-H "Content-Type: application/json" \
-d '{"alias": "example"}'

# 発行したDIDの確認
curl http://localhost:3000/did/did:web:example
```

### 2. リンクされたVCの発行
```bash
# 発行したDIDを使用してVCを作成
curl -X POST http://localhost:3000/credentials/linked \
-H "Content-Type: application/json" \
-d '{
  "issuer": "did:web:example",
  "subject": "did:web:example",
  "holder": "did:web:example",
  "primaryClaims": {
    "name": "Alice",
    "age": 25
  },
  "secondaryClaims": {
    "additionalInfo": "Additional information about Alice"
  }
}'
```

## 注意事項

- このデモアプリケーションはローカル環境での実行を想定しています
- データはSQLiteデータベースに保存されます（`database/database.sqlite`）
- 本番環境での使用には、適切なセキュリティ対策が必要です
- `did:web`メソッドを使用していますが、実際のWebサーバーへのデプロイには追加の設定が必要です

## エラーハンドリング

エラーが発生した場合、以下の形式でレスポンスが返されます：
```json
{
  "error": "エラーメッセージ"
}
```

## ディレクトリ構造

```
.
├── README.md
├── package.json
├── tsconfig.json
├── .env
├── database/
│   └── database.sqlite
└── src/
    ├── index.ts
    ├── config/
    │   └── agent.ts
    ├── services/
    │   ├── vcService.ts
    │   └── vpService.ts
    └── types/
        └── credentials.ts