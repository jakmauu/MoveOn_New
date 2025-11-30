// Lightweight AI client: uses external API if VITE_AI_API_URL is configured,
// otherwise falls back to a local rule-based assistant over a small foods dataset.
import { foods } from '../data/foods.js'

function now() { return Date.now() }

export async function askMealAssistant({ messages, userProfile, system }) {
  // If an API URL is provided, try calling it. Expect a JSON body with {messages, system, user}
  const apiUrl = import.meta.env.VITE_AI_API_URL
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ messages, system, user: userProfile })
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      if (data?.role && data?.content) {
        return { role: 'assistant', content: data.content, ts: now(), meta: data.meta }
      }
    } catch (e) {
      console.warn('AI API failed, falling back to local:', e)
    }
  }
  // Fallback local assistant
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const reply = localDietAssistant(lastUser, { foods, system, user: userProfile })
  return { role: 'assistant', content: reply.text, ts: now(), meta: { sources: reply.sources } }
}

function localDietAssistant(query, ctx) {
  const q = query.toLowerCase()

  // Simple intents
  if (/alternatif.*nasi|pengganti.*nasi|alternatif nasi/.test(q)) {
    return text([
      'Alternatif nasi lebih sehat:',
      '- Nasi merah (serat lebih tinggi, GI lebih rendah)',
      '- Kentang rebus/panggang (porsi 150–200 g)',
      '- Oats atau quinoa (lebih mahal, tapi tinggi serat/protein)',
      '- Ubi/ singkong rebus (porsi 100–150 g)',
      'Sesuaikan porsi agar sesuai target kalori/makro harian.'
    ])
  }

  if (/sarapan.*tinggi.*protein|breakfast.*protein|sarapan.*murah/.test(q)) {
    return text([
      'Ide sarapan tinggi protein, hemat:',
      '- Telur orak-arik 2–3 butir + tempe 50–75 g + sayur tumis',
      '- Greek yogurt/plain yogurt 200 g + pisang + kacang',
      '- Oatmeal 50–60 g + whey/skim + 1 sdm selai kacang',
      'Estimasi makro per opsi: 25–40 g protein, 300–450 kkal.'
    ])
  }

  // RAG-like: retrieve foods relevant to calories, protein, etc.
  const wantsPlan = /(meal\s*plan|rencana makan|menu.*hari|sehari|1 hari|satu hari)/.test(q)
  const deficitMatch = q.match(/defisit.*?(\d{2,4})\s?k?kal|minus\s?(\d{2,4})/)
  const caloriesTarget = deficitMatch ? Math.max(1200, 2000 - Number(deficitMatch[1] || deficitMatch[2])) : null
  const proteinTarget = /protein.*(\d{2,3})\s?g/.test(q) ? Number(RegExp.$1) : null

  const candidates = rankFoods(q, ctx.foods)
  if (wantsPlan) {
    const plan = buildOneDayPlan({
      foods: candidates.slice(0, 30),
      caloriesTarget: caloriesTarget || 1800,
      proteinTarget: proteinTarget || 100,
    })
    return {
      text: plan.text,
      sources: plan.used.map(f => ({ name: f.name, url: f.url }))
    }
  }

  const top = candidates.slice(0, 5)
  const lines = ['Beberapa item relevan:']
  for (const f of top) {
    lines.push(`- ${f.name}: ${f.calories} kkal/100g, P${f.protein}/L${f.fat}/K${f.carbs} | ${f.tags.join(', ')}`)
  }
  lines.push('', 'Tanyakan kebutuhan spesifik (target kalori/makro, preferensi/larangan makanan), nanti saya susunkan meal plan.')
  return { text: lines.join('\n'), sources: top.map(f => ({ name: f.name, url: f.url })) }
}

function text(lines) {
  return { text: Array.isArray(lines) ? lines.join('\n') : String(lines), sources: [] }
}

function rankFoods(query, foods) {
  const q = query.toLowerCase()
  const scores = foods.map(f => {
    let s = 0
    const bag = [f.name, ...(f.alias || []), ...(f.tags || []), f.notes || ''].join(' ').toLowerCase()
    for (const token of q.split(/[^a-z0-9]+/).filter(Boolean)) {
      if (bag.includes(token)) s += 2
    }
    // heuristic: high protein preference if mention
    if (/protein|otot|cutting|bulk/i.test(query)) s += f.protein / 5
    if (/diet|defisit|kalori|cut|fat/i.test(query)) s += Math.max(0, 30 - f.fat) / 5
    if (/diabetes|gula|gi/i.test(query)) s += (f.fiber || 0) / 2 - f.sugar
    return { ...f, _score: s }
  })
  return scores.sort((a, b) => b._score - a._score)
}

function buildOneDayPlan({ foods, caloriesTarget = 1800, proteinTarget = 100 }) {
  // pick items by tags
  const byTag = (tag) => foods.filter(f => (f.tags || []).includes(tag))
  const protein = byTag('protein').slice(0, 6)
  const carb = byTag('carb').slice(0, 6)
  const veggie = byTag('veggie').slice(0, 6)
  const fat = byTag('fat').slice(0, 6)

  const used = new Set()
  const pick = (arr) => {
    for (const f of arr) if (!used.has(f.name)) { used.add(f.name); return f }
    return arr[0] || foods[0]
  }

  const meals = [
    { name: 'Sarapan', items: [pick(protein), pick(carb), pick(veggie)] },
    { name: 'Makan Siang', items: [pick(protein), pick(carb), pick(veggie)] },
    { name: 'Makan Malam', items: [pick(protein), pick(carb), pick(veggie)] },
    { name: 'Camilan', items: [pick(protein), pick(fat)] },
  ]

  // Simple portion scaling to roughly meet targets
  const total = { cal: 0, p: 0 }
  for (const meal of meals) {
    meal.portions = meal.items.map((f) => {
      const base = 100 // grams
      total.cal += (f.calories || 0)
      total.p += (f.protein || 0)
      return { name: f.name, grams: base, ref: f }
    })
  }

  const calScale = Math.max(0.7, Math.min(1.5, caloriesTarget / Math.max(1200, total.cal)))
  const proScale = proteinTarget / Math.max(60, total.p)
  const scale = (calScale + proScale) / 2
  for (const meal of meals) for (const p of meal.portions) p.grams = Math.round(p.grams * scale)

  const usedFoods = []
  const lines = []
  lines.push(`Target kira-kira: ${Math.round(caloriesTarget)} kkal, protein ${Math.round(proteinTarget)} g`)
  for (const meal of meals) {
    lines.push('', `${meal.name}:`)
    for (const p of meal.portions) {
      lines.push(`- ${p.name} ~ ${p.grams} g`)
      usedFoods.push(p.ref)
    }
  }
  lines.push('', 'Catatan: Ini estimasi kasar. Sesuaikan preferensi, alergi, dan anggaran. Minum cukup air, dan tambah sayur kalau kurang.')
  return { text: lines.join('\n'), used: Array.from(new Set(usedFoods)) }
}
