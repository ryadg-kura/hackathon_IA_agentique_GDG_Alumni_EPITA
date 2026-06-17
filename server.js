import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { runOrchestrator } from './agents/orchestrator.js'
import { redisClient } from './lib/redis.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'client/dist')))

app.post('/api/run', async (req, res) => {
  const { profile, sessionId } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    await runOrchestrator(profile, sessionId, send)
    send('done', { success: true })
  } catch (err) {
    console.error(err)
    send('error', { message: err.message })
  } finally {
    res.end()
  }
})

app.get('/api/session/:id', async (req, res) => {
  const result = await redisClient.get(`session:${req.params.id}`)
  if (!result) return res.status(404).json({ error: 'Session not found' })
  res.json(JSON.parse(result))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
