import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AriaChat from './components/AriaChat.jsx'
import ResultsPage from './components/ResultsPage.jsx'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  left: Math.random() * 100,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 10,
}))

export default function App() {
  const [view, setView] = useState('chat')   // 'chat' | 'results'
  const [results, setResults] = useState(null)

  const handleComplete = ({ strategy, letters, profile }) => {
    setResults({ strategy, letters, profile })
    setView('results')
  }

  const handleBack = () => {
    setResults(null)
    setView('chat')
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#07070f' }}>
      {/* Particules de fond */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <AnimatePresence mode="wait">
        {view === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <AriaChat onComplete={handleComplete} />
          </motion.div>
        )}

        {view === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <ResultsPage
              strategy={results.strategy}
              letters={results.letters}
              profile={results.profile}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
