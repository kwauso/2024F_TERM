import express from 'express'
import { initializeAgent } from './config/agent'
import { VCService } from './services/vcService'
import { VPService } from './services/vpService'

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
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // リンクされたVCの作成とVPの生成
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
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer().catch(console.error) 
// DIDの作成
app.post('/did', async (req, res) => {
  try {
    const did = await agent.didManagerCreate({
      provider: 'did:web',
      alias: req.body.alias || 'localhost'
    })
    res.json(did)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// リンクされたVCの作成とVPの生成
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
}) 