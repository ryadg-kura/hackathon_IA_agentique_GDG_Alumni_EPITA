import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Aria from './Aria.jsx'
import ChatMessage from './ChatMessage.jsx'
import LetterModal from './LetterModal.jsx'

const SPECIALITES = [
  'Mathematiques', 'NSI', 'Physique-Chimie', 'SVT',
  'SES', 'Histoire-Geo', 'Humanites', 'Langues', 'Arts',
]

const REGIONS = ['Ile-de-France', 'Partout en France', 'Lyon', 'Bordeaux', 'Lille', 'Nantes']

const QUESTIONS = [
  {
    key: 'prenom',
    ask: () => "Salut. Je suis ARIA, ton agent d'orientation. Quel est ton prenom ?",
    type: 'text',
    placeholder: 'Ton prenom...',
    build: (val, p) => ({ ...p, prenom: val }),
  },
  {
    key: 'specialites',
    ask: (p) => `${p.prenom}, quelles sont tes specialites au bac ? (choisis jusqu'a 3)`,
    type: 'chips',
    options: SPECIALITES,
    multi: true,
    max: 3,
    build: (val, p) => ({ ...p, specialites: val }),
  },
  {
    key: 'moyenne',
    ask: () => 'Ta moyenne generale sur 20 ?',
    type: 'number',
    placeholder: '13.5',
    build: (val, p) => ({ ...p, notes: { ...p.notes, moyenne_generale: parseFloat(val) } }),
  },
  {
    key: 'note_spe1',
    ask: (p) => `Ta note en ${p.specialites?.[0] ?? 'premiere specialite'} ?`,
    type: 'number',
    placeholder: '14',
    build: (val, p) => ({
      ...p,
      notes: { ...p.notes, [p.specialites?.[0] ?? 'spe1']: parseFloat(val) },
    }),
  },
  {
    key: 'note_spe2',
    ask: (p) => `Et en ${p.specialites?.[1] ?? 'deuxieme specialite'} ?`,
    type: 'number',
    placeholder: '16',
    build: (val, p) => ({
      ...p,
      notes: { ...p.notes, [p.specialites?.[1] ?? 'spe2']: parseFloat(val) },
    }),
    skip: (p) => !p.specialites?.[1],
  },
  {
    key: 'interets',
    ask: () => 'Ce qui te passionne en dehors des cours ?',
    type: 'text',
    placeholder: 'informatique, jeux video, musique...',
    build: (val, p) => ({
      ...p,
      interets: val.split(',').map(s => s.trim()).filter(Boolean),
    }),
  },
  {
    key: 'geo',
    ask: () => 'Tu veux rester dans quelle region ?',
    type: 'chips',
    options: REGIONS,
    multi: false,
    build: (val, p) => ({ ...p, contraintes: { ...p.contraintes, geo: val } }),
  },
  {
    key: 'ambition',
    ask: (p) => `Derniere question ${p.prenom} : en une phrase, c'est quoi ton objectif apres le bac ?`,
    type: 'text',
    placeholder: "Devenir ingenieur en IA...",
    build: (val, p) => ({ ...p, ambition: val }),
  },
]

function parseSSEChunk(raw) {
  const events = []
  const blocks = raw.split('\n\n').filter(Boolean)
  for (const block of blocks) {
    const lines = block.split('\n')
    let type = null, data = null
    for (const line of lines) {
      if (line.startsWith('event: ')) type = line.slice(7).trim()
      if (line.startsWith('data: ')) {
        try { data = JSON.parse(line.slice(6)) } catch {}
      }
    }
    if (type && data !== null) events.push({ type, data })
  }
  return events
}

export default function AriaChat() {
  const [phase, setPhase] = useState('intro')  // intro | collecting | running | done
  const [qIndex, setQIndex] = useState(0)
  const [profile, setProfile] = useState({ notes: {}, contraintes: {}, specialites: [] })
  const [messages, setMessages] = useState([])
  const [letters, setLetters] = useState({})
  const [ariaState, setAriaState] = useState('idle')
  const [inputVal, setInputVal] = useState('')
  const [chips, setChips] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [agentLabel, setAgentLabel] = useState('')
  const bottomRef = useRef(null)
  const bufferRef = useRef('')

  // Message helpers
  const addMsg = (msg) => setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }])

  const ariaSpeak = (text, delay = 0) => {
    setTimeout(() => {
      setAriaState('talking')
      addMsg({ from: 'aria', type: 'text', text })
      setTimeout(() => setAriaState('idle'), Math.min(text.length * 30, 2500))
    }, delay)
  }

  // Intro
  useEffect(() => {
    setTimeout(() => {
      setAriaState('excited')
      setTimeout(() => {
        setAriaState('talking')
        addMsg({ from: 'aria', type: 'text', text: QUESTIONS[0].ask({}) })
        setTimeout(() => setAriaState('idle'), 1800)
        setPhase('collecting')
      }, 800)
    }, 600)
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Submit answer
  const submitAnswer = (val) => {
    const q = getQuestion(qIndex)
    if (!val || (Array.isArray(val) && val.length === 0)) return

    const displayVal = Array.isArray(val) ? val.join(', ') : String(val)
    addMsg({ from: 'user', type: 'text', text: displayVal })

    const newProfile = q.build(val, profile)
    setProfile(newProfile)
    setInputVal('')
    setChips([])

    // Next question
    let next = qIndex + 1
    while (next < QUESTIONS.length && QUESTIONS[next].skip?.(newProfile)) next++

    if (next >= QUESTIONS.length) {
      // All questions done - launch agents
      setTimeout(() => launchAgents(newProfile), 400)
    } else {
      setQIndex(next)
      setTimeout(() => {
        setAriaState('talking')
        addMsg({ from: 'aria', type: 'text', text: QUESTIONS[next].ask(newProfile) })
        setTimeout(() => setAriaState('idle'), 1800)
      }, 500)
    }
  }

  const getQuestion = (idx) => QUESTIONS[Math.min(idx, QUESTIONS.length - 1)]

  const handleKey = (e) => {
    if (e.key === 'Enter' && inputVal.trim()) submitAnswer(inputVal.trim())
  }

  const toggleChip = (val) => {
    const q = getQuestion(qIndex)
    if (q.multi) {
      setChips(prev =>
        prev.includes(val)
          ? prev.filter(x => x !== val)
          : prev.length < (q.max ?? 99) ? [...prev, val] : prev
      )
    } else {
      submitAnswer(val)
    }
  }

  // Launch agents
  const launchAgents = async (finalProfile) => {
    setPhase('running')
    setAriaState('thinking')

    setTimeout(() => {
      addMsg({ from: 'aria', type: 'text', text: `Parfait ${finalProfile.prenom ?? ''}. J'analyse ton profil et je cherche les meilleures formations pour toi.` })
    }, 300)

    const sessionId = crypto.randomUUID()
    bufferRef.current = ''

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: finalProfile, sessionId }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        bufferRef.current += decoder.decode(value, { stream: true })
        const events = parseSSEChunk(bufferRef.current)
        const last = bufferRef.current.lastIndexOf('\n\n')
        bufferRef.current = last >= 0 ? bufferRef.current.slice(last + 2) : bufferRef.current
        for (const { type, data } of events) handleSSEEvent(type, data)
      }
    } catch (err) {
      setAriaState('idle')
      addMsg({ from: 'aria', type: 'text', text: `Une erreur est survenue : ${err.message}` })
    }
  }

  const handleSSEEvent = (type, data) => {
    switch (type) {
      case 'agent_start':
        setAgentLabel(data.label)
        setAriaState('thinking')
        break

      case 'agent_done':
        if (data.agent === 'explorer') {
          addMsg({ from: 'aria', type: 'text', text: `J'ai identifie ${data.count} formations pertinentes pour ton profil.` })
        }
        if (data.agent === 'strategist') {
          setAriaState('excited')
          setTimeout(() => setAriaState('talking'), 600)
          addMsg({ from: 'aria', type: 'text', text: `La strategie est construite. Voici ce que je te recommande.` })
          setTimeout(() => setAriaState('idle'), 2200)
        }
        if (data.agent === 'writer') {
          addMsg({ from: 'aria', type: 'text', text: 'Les projets de formation motives sont prets. Clique sur une formation pour le lire.' })
        }
        break

      case 'card_placed':
        setTimeout(() => {
          addMsg({
            from: 'aria',
            type: 'formation',
            formation: data.formation,
            category: data.category,
          })
        }, Math.random() * 300)
        break

      case 'letter_token':
        setLetters(prev => ({
          ...prev,
          [data.formationId]: (prev[data.formationId] ?? '') + data.token,
        }))
        break

      case 'complete':
        setPhase('done')
        setAriaState('idle')
        break

      case 'error':
        setAriaState('idle')
        addMsg({ from: 'aria', type: 'text', text: `Erreur : ${data.message}` })
        break
    }
  }

  const currentQ = phase === 'collecting' ? getQuestion(qIndex) : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: 640,
      margin: '0 auto',
      padding: '0 16px',
    }}>
      {/* ARIA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 16,
        gap: 12,
      }}>
        <Aria state={ariaState} />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(165,180,252,0.7)', textTransform: 'uppercase' }}>
            ARIA
          </div>
          {agentLabel && phase === 'running' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, color: 'rgba(251,191,36,0.7)', marginTop: 2 }}
            >
              {agentLabel}
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        paddingBottom: 8,
      }}>
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              onCardClick={(formation, category) => setSelectedCard({ formation, category })}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ paddingBottom: 20, paddingTop: 8 }}>
        {phase === 'collecting' && currentQ && (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {currentQ.type === 'text' || currentQ.type === 'number' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  autoFocus
                  className="aria-input"
                  type={currentQ.type === 'number' ? 'text' : 'text'}
                  inputMode={currentQ.type === 'number' ? 'decimal' : 'text'}
                  placeholder={currentQ.placeholder}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button
                  onClick={() => inputVal.trim() && submitAnswer(inputVal.trim())}
                  style={{
                    padding: '0 20px',
                    borderRadius: 14,
                    background: 'rgba(99,102,241,0.25)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    color: '#a5b4fc',
                    fontSize: 14,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  Envoyer
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {currentQ.options.map(opt => (
                    <button
                      key={opt}
                      className={`chip ${chips.includes(opt) ? 'selected' : ''}`}
                      onClick={() => toggleChip(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {currentQ.multi && chips.length > 0 && (
                  <button
                    onClick={() => submitAnswer(chips)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 14,
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: '#a5b4fc',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Confirmer ({chips.length} selectionne{chips.length > 1 ? 's' : ''})
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Letter modal */}
      {selectedCard && (
        <LetterModal
          formation={selectedCard.formation}
          category={selectedCard.category}
          letter={letters[selectedCard.formation.id]}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  )
}
