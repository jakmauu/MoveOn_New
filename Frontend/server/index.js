import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

app.post('/meal-assistant', async (req, res) => {
  const { messages = [], system, user } = req.body || {}
  const apiKey = process.env.OPENAI_API_KEY

  // Basic validation
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' })
  }

  // If no API key, return a friendly stub so dev can continue
  if (!apiKey) {
    const last = [...messages].reverse().find(m => m.role === 'user')?.content || ''
    const content = [
      'Stub (no OPENAI_API_KEY set). Tetap bisa dipakai untuk prototyping.',
      '',
      'Ringkasan pertanyaan kamu:',
      last.slice(0, 500) || '(kosong)',
      '',
      'Contoh lanjutan yang bisa kamu tanya:',
      '- Target kalori & protein harian',
      '- Preferensi/larangan makanan (halal, vegetarian, alergi)',
      '- Budget & waktu masak',
    ].join('\n')
    return res.json({ role: 'assistant', content })
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: system || 'You are a helpful nutrition coach for Indonesia context. Provide safe, practical meal plans with macro estimates when relevant.' },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      })
    })
    if (!r.ok) {
      const txt = await r.text()
      throw new Error(`OpenAI ${r.status}: ${txt}`)
    }
    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content || 'Maaf, saya belum bisa menjawab.'
    res.json({ role: 'assistant', content })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'AI failed' })
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`Meal Assistant API listening on http://localhost:${port}`))
