import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AgentPanel from './AgentPanel.jsx'
import StrategyBoard from './StrategyBoard.jsx'
import LetterModal from './LetterModal.jsx'

const AGENT_ORDER = ['explorer', 'strategist', 'writer']

const AGENT_LABELS = {
  explorer: 'Exploration des formations',
  strategist: 'Construction de la strategie',
  writer: 'Redaction des projets motives',
}

function parseSSEChunk(raw) {
  const events = []
  const blocks = raw.split('\n\n').filter(Boolean)
  for (const block of blocks) {
    const lines = block.split('\n')
    let type = null
    let data = null
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

export default function Arena({ profile, sessionId, onDone }) {
  const [agentStatus, setAgentStatus] = useState({
    explorer: 'idle',
    strategist: 'idle',
    writer: 'idle',
  })
  const [agentMessages, setAgentMessages] = useState({
    explorer: '',
    strategist: '',
    writer: '',
  })
  const [agentLabels, setAgentLabels] = useState({
    explorer: AGENT_LABELS.explorer,
    strategist: AGENT_LABELS.strategist,
    writer: AGENT_LABELS.writer,
  })
  const [strategy, setStrategy] = useState({ securite: [], cible: [], ambition: [] })
  const [letters, setLetters] = useState({})
  const [replanMessage, setReplanMessage] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null) // { formation, category }
  const [error, setError] = useState(null)
  const bufferRef = useRef('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const response = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, sessionId }),
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (!cancelled) {
          const { value, done } = await reader.read()
          if (done) break

          bufferRef.current += decoder.decode(value, { stream: true })
          const events = parseSSEChunk(bufferRef.current)

          // Conserve le reste non parse dans le buffer
          const lastDouble = bufferRef.current.lastIndexOf('\n\n')
          bufferRef.current = lastDouble >= 0
            ? bufferRef.current.slice(lastDouble + 2)
            : bufferRef.current

          for (const { type, data } of events) {
            handleEvent(type, data)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  function handleEvent(type, data) {
    switch (type) {
      case 'agent_start':
        setAgentStatus((s) => ({ ...s, [data.agent]: 'active' }))
        setAgentLabels((l) => ({ ...l, [data.agent]: data.label }))
        setAgentMessages((m) => ({ ...m, [data.agent]: '' }))
        break

      case 'agent_token':
        setAgentMessages((m) => ({ ...m, [data.agent]: m[data.agent] + data.token }))
        break

      case 'agent_done':
        setAgentStatus((s) => ({ ...s, [data.agent]: 'done' }))
        if (data.message) {
          setAgentMessages((m) => ({ ...m, [data.agent]: data.message }))
        }
        break

      case 'card_placed':
        setStrategy((prev) => ({
          ...prev,
          [data.category]: [...(prev[data.category] ?? []), data.formation],
        }))
        break

      case 'letter_token':
        setLetters((prev) => ({
          ...prev,
          [data.formationId]: (prev[data.formationId] ?? '') + data.token,
        }))
        break

      case 'replan':
        setReplanMessage(data.reason)
        setTimeout(() => setReplanMessage(null), 4000)
        break

      case 'complete':
        onDone?.()
        break

      case 'error':
        setError(data.message)
        break

      default:
        break
    }
  }

  const handleCardClick = (formation, category) => {
    setSelectedCard({ formation, category })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Bandeau replanification */}
      <AnimatePresence>
        {replanMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            {replanMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Erreur */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          Erreur : {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Colonne agents */}
        <div className="col-span-4 space-y-4">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
            Agents en cours
          </h2>
          {AGENT_ORDER.map((key) => (
            <AgentPanel
              key={key}
              agentKey={key}
              status={agentStatus[key]}
              message={agentMessages[key]}
              label={agentLabels[key]}
            />
          ))}

          {/* Modele etudiant en direct */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/5 bg-white/5 p-4 mt-4"
          >
            <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
              Modele etudiant
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Formations analysees</span>
                <span className="text-white/60 font-mono">
                  {strategy.securite.length + strategy.cible.length + strategy.ambition.length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Lettres generees</span>
                <span className="text-white/60 font-mono">{Object.keys(letters).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Specialites</span>
                <span className="text-white/60 font-mono">
                  {profile.specialites?.join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Moyenne generale</span>
                <span className="text-white/60 font-mono">
                  {profile.notes?.moyenne_generale}/20
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tableau strategie */}
        <div className="col-span-8">
          <StrategyBoard strategy={strategy} onCardClick={handleCardClick} />
        </div>
      </div>

      {/* Modal lettre */}
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
