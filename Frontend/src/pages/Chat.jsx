import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ChatPage() {
  const { user } = useAuth()
  const role = user?.role || 'guest'
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_messages')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollerRef = useRef(null)

  const systemPreamble = useMemo(() => (
    'You are a helpful nutrition coach. Create practical meal ideas for Indonesia context when possible (e.g., nasi merah, tempe, sayur). Ensure suggestions are safe, balanced, and include macros estimate when appropriate. Adapt tone and details for a ' + (role === 'coach' ? 'coach (advanced)' : 'user (beginner)') + '.'
  ), [role])

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user', content: text, ts: Date.now() }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      // TODO: Integrate with backend AI chat API
      // For now, show placeholder response
      const reply = {
        role: 'assistant',
        content: 'Fitur AI Chat sedang dalam pengembangan. Silakan gunakan fitur lain seperti Task Assignment dan Meal Planning.',
        ts: Date.now()
      }
      setMessages(m => [...m, reply])
    } catch (err) {
      console.error(err)
      setMessages(m => [...m, { role: 'assistant', content: 'Maaf, terjadi kesalahan saat memproses. Coba lagi sebentar ya.', ts: Date.now(), meta: { error: true } }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e)
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('chat_messages')
  }

  return (
    <div className="px-4 sm:px-6 md:px-16 py-4 sm:py-6 min-h-[calc(100vh-140px)]">
      <div className="max-w-3xl mx-auto bg-[#001f47] border border-white/5 rounded-lg flex flex-col h-[70vh] sm:h-[72vh]">
        <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Meal Plan Assistant</h1>
            <p className="text-xs text-white/60">Tanya seputar meal plan, makro, dan ide menu sehat.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#003266]/60 text-white/70 border border-white/10">Mode: {import.meta.env.VITE_AI_API_URL ? 'API' : 'Local'}</span>
            <button onClick={clearChat} className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/5">Clear</button>
          </div>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-sm text-white/70">
              <p>Contoh pertanyaan:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Bikinin meal plan 1 hari untuk defisit kalori 500 kkal.</li>
                <li>Rekomendasikan sarapan tinggi protein tapi murah.</li>
                <li>Apa alternatif nasi yang lebih sehat?</li>
              </ul>
            </div>
          )}
          {messages.map((m, idx) => (
            <MessageBubble key={idx} role={m.role} content={m.content} meta={m.meta} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Assistant sedang mengetik…
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-white/10">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tulis pesan… (Enter untuk kirim, Shift+Enter baris baru)"
              rows={2}
              className="flex-1 resize-none rounded-md bg-[#003266] text-white placeholder-white/60 p-3 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded bg-yellow-400 text-[#001a3d] font-semibold text-sm disabled:opacity-50"
            >Kirim</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ role, content, meta }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-yellow-400 text-[#001a3d]' : 'bg-[#003266] text-white'} max-w-[85%] whitespace-pre-wrap text-sm p-3 rounded-lg border border-white/10`}
        title={meta?.sources ? `Sources: ${meta.sources.map(s => s.name).join(', ')}` : undefined}
      >
        {content}
        {meta?.sources && meta.sources.length > 0 && (
          <div className="mt-2 text-[10px] opacity-80">
            Referensi: {meta.sources.map((s, i) => (
              <a key={i} href={s.url || '#'} target="_blank" rel="noreferrer" className="underline hover:text-yellow-300">
                {s.name}
              </a>
            )).reduce((prev, curr) => [prev, ', ', curr])}
          </div>
        )}
      </div>
    </div>
  )
}
