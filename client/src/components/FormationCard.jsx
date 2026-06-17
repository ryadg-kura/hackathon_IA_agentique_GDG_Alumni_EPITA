import { motion } from 'framer-motion'

const CATEGORY_STYLES = {
  securite: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Securite',
    bar: 'bg-emerald-500',
  },
  cible: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    label: 'Cible',
    bar: 'bg-blue-500',
  },
  ambition: {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    label: 'Ambition',
    bar: 'bg-purple-500',
  },
}

export default function FormationCard({ formation, category, onClick }) {
  const style = CATEGORY_STYLES[category]

  return (
    <motion.div
      layout
      layoutId={formation.id}
      initial={{ opacity: 0, scale: 0.8, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onClick(formation, category)}
      className={`cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-white/20 transition-all card-glow-${category} group`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{formation.nom}</div>
          <div className="text-xs text-white/40 truncate">{formation.etablissement}</div>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Barre de probabilite */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/30">Probabilite acces</span>
          <span className="text-xs font-semibold text-white">{formation.tauxEstime ?? '?'}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${formation.tauxEstime ?? 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className={`h-full rounded-full ${style.bar}`}
          />
        </div>
      </div>

      {/* Justification */}
      {formation.justification && (
        <p className="text-xs text-white/35 leading-relaxed line-clamp-2 group-hover:text-white/50 transition-colors">
          {formation.justification}
        </p>
      )}

      <div className="mt-3 text-xs text-white/20 group-hover:text-white/40 transition-colors">
        Voir le projet motive
      </div>
    </motion.div>
  )
}
