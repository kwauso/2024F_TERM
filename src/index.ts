import 'dotenv/config'
import express from 'express'
import { initializeAgent } from './config/agent'
import { VCService } from './services/vcService'
import { VPService } from './services/vpService'

// エラー処理のためのヘルパー関数
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

const startServer = async () => {
  const agent = await initializeAgent()
  const app = express()
  app.use(express.json())

  const vcService = new VCService(agent)
  const vpService = new VPService(agent)

  // DIDの作成
  app.post('/did', async (req, res) => {
    try {
      const did = await agent.didManagerCreate({
        provider: 'did:web',
        alias: req.body.alias || 'localhost'
      })
      res.json(did)
    } catch (error: unknown) {
      res.status(500).json({ error: handleError(error) })
    }
  })

  // すべてのDIDを取得
  app.get('/dids', async (req, res) => {
    try {
      const dids = await agent.didManagerFind()
      res.json(dids)
    } catch (error: unknown) {
      res.status(500).json({ error: handleError(error) })
    }
  })

  // 特定のDIDを取得
  app.get('/did/:did', async (req, res) => {
    try {
      const did = await agent.didManagerGet({ did: req.params.did })
      res.json(did)
    } catch (error: unknown) {
      res.status(500).json({ error: handleError(error) })
    }
  })

  // リンクされたVCとVPの作成
  app.post('/credentials/linked', async (req, res) => {
    try {
      // プライマリーVCの作成
      const primaryVC = await vcService.createVC({
        issuer: req.body.issuer,
        subject: req.body.subject,
        claims: req.body.primaryClaims,
        types: ['PrimaryCredential']
      })

      // セカンダリーVCの作成
      const secondaryVC = await vcService.createVC({
        issuer: req.body.issuer,
        subject: req.body.subject,
        claims: {
          relatedCredentialId: primaryVC.proof.jwt,
          ...req.body.secondaryClaims
        },
        types: ['SecondaryCredential']
      })

      // VPの作成
      const vp = await vpService.createVP(
        [primaryVC, secondaryVC],
        req.body.holder
      )

      res.json({
        primaryVC,
        secondaryVC,
        verifiablePresentation: vp
      })
    } catch (error: unknown) {
      res.status(500).json({ error: handleError(error) })
    }
  })

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Server startup error:', handleError(error))
}) 