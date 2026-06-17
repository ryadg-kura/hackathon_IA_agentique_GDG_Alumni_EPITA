import { motion, AnimatePresence } from 'framer-motion'
import FormationCard from './FormationCard.jsx'

const COLUMNS = [
  {
    key: 'securite',
    label: 'Securite',
    subtitle: 'Tres atteignable',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
  {
    key: 'cible',
    label: 'Cible',
    subtitle: 'Bon rapport ambition / risque',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    dot: 'bg-blue-400',
  },
  {
    key: 'ambition',
    label: 'Ambition',
    subtitle: 'Challengeant mais possible',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    dot: 'bg-purple-400',
  },
]

export default function StrategyBoard({ strategy, onCardClick }) {
  const total =
    (strategy.securite?.length ?? 0) +
    (strategy.cible?.length ?? 0) +
    (strategy.ambition?.length ?? 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
          Strategie de voeux
        </h2>
        {total > 0 && (
          <span className="text-xs text-white/30">{total} formation{total > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const cards = strategy[col.key] ?? []
          return (
            <div key={col.key} className={`rounded-2xl border ${col.border} ${col.bg} p-4 min-h-48`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <div>
                  <div className={`text-xs font-bold ${col.color} uppercase tracking-widest`}>
                    {col.label}
                  </div>
                  <div className="text-xs text-white/25">{col.subtitle}</div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {cards.map((formation) => (
                    <FormationCard
                      key={formation.id}
                      formation={formation}
                      category={col.key}
                      onClick={onCardClick}
                    />
                  ))}
                </AnimatePresence>

                {cards.length === 0 && (
                  <div className="h-20 rounded-xl border border-dashed border-white/5 flex items-center justify-center">
                    <span className="text-xs text-white/15">En attente...</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
