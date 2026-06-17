import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LetterModal from './LetterModal.jsx'

const CATEGORIES = [
  {
    key: 'securite',
    label: 'Securite',
    subtitle: 'Tres atteignable',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.25)',
    dot: '#34d399',
  },
  {
    key: 'cible',
    label: 'Cible',
    subtitle: 'Bon ratio ambition / risque',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.15)',
    border: 'rgba(96,165,250,0.25)',
    dot: '#60a5fa',
  },
  {
    key: 'ambition',
    label: 'Ambition',
    subtitle: 'Challengeant, mais possible',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.15)',
    border: 'rgba(192,132,252,0.25)',
    dot: '#c084fc',
  },
]

function FormationCard({ formation, category, onClick }) {
  const cfg = CATEGORIES.find(c => c.key === category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      whileHover={{ y: -3, boxShadow: `0 8px 40px ${cfg.glow}` }}
      onClick={() => onClick(formation, category)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        boxShadow: `0 2px 20px ${cfg.glow}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>
            {formation.nom}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)' }}>
            {formation.etablissement}
          </div>
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: cfg.color,
          marginLeft: 12,
          minWidth: 48,
          textAlign: 'right',
        }}>
          {formation.tauxEstime ?? '?'}%
        </div>
      </div>

      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${formation.tauxEstime ?? 0}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ height: '100%', background: cfg.color, borderRadius: 3 }}
        />
      </div>

      {formation.justification && (
        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', lineHeight: 1.55, margin: 0 }}>
          {formation.justification}
        </p>
      )}

      <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.18)', marginTop: 12 }}>
        Voir le projet motive
      </div>
    </motion.div>
  )
}

export default function ResultsPage({ strategy, letters, profile, onBack }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const total = (strategy.securite?.length ?? 0) + (strategy.cible?.length ?? 0) + (strategy.ambition?.length ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        padding: '48px 32px 80px',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 52 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#a5b4fc', textTransform: 'uppercase' }}>
            Analyse ARIA
          </span>
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#f1f5f9',
          margin: '0 0 10px',
          lineHeight: 1.2,
        }}>
          Ta strategie Parcoursup
          {profile?.prenom ? `, ${profile.prenom}` : ''}
        </h1>

        <p style={{ fontSize: 15, color: 'rgba(226,232,240,0.4)', margin: 0 }}>
          {total} formation{total > 1 ? 's' : ''} selectionnee{total > 1 ? 's' : ''} et analysees selon ton profil
        </p>

        <button
          onClick={onBack}
          style={{
            marginTop: 20,
            padding: '8px 18px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(226,232,240,0.4)',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          Recommencer
        </button>
      </div>

      {/* 3 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {CATEGORIES.map((cat, colIdx) => {
          const formations = strategy[cat.key] ?? []
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.1, duration: 0.4 }}
            >
              {/* Header colonne */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: `1px solid ${cat.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)' }}>
                    {cat.subtitle}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(226,232,240,0.25)',
                }}>
                  {formations.length}
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AnimatePresence>
                  {formations.map((f, i) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: colIdx * 0.1 + i * 0.08 }}
                    >
                      <FormationCard
                        formation={f}
                        category={cat.key}
                        onClick={(formation, category) => setSelectedCard({ formation, category })}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {formations.length === 0 && (
                  <div style={{
                    height: 80,
                    borderRadius: 12,
                    border: '1px dashed rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(226,232,240,0.15)',
                    fontSize: 12,
                  }}>
                    Aucune formation
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal lettre */}
      {selectedCard && (
        <LetterModal
          formation={selectedCard.formation}
          category={selectedCard.category}
          letter={letters?.[selectedCard.formation.id]}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </motion.div>
  )
}
