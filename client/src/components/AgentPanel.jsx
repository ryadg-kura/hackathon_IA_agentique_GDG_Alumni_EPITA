import { motion, AnimatePresence } from 'framer-motion'
import { Search, BarChart3, PenLine } from 'lucide-react'

const AGENTS = {
  explorer: {
    icon: Search,
    label: 'Explorateur',
    color: 'from-sky-500 to-cyan-500',
    border: 'border-sky-500/40',
    glow: 'shadow-sky-500/30',
    bg: 'bg-sky-500/10',
    dot: 'bg-sky-400',
  },
  strategist: {
    icon: BarChart3,
    label: 'Strategiste',
    color: 'from-violet-500 to-indigo-500',
    border: 'border-violet-500/40',
    glow: 'shadow-violet-500/30',
    bg: 'bg-violet-500/10',
    dot: 'bg-violet-400',
  },
  writer: {
    icon: PenLine,
    label: 'Redacteur',
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/30',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-400',
  },
}

export default function AgentPanel({ agentKey, status, message, label }) {
  const config = AGENTS[agentKey]
  const Icon = config.icon
  const isActive = status === 'active'
  const isDone = status === 'done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 transition-all duration-500 ${
        isActive
          ? `${config.border} ${config.bg} shadow-xl ${config.glow}`
          : isDone
          ? 'border-white/10 bg-white/5'
          : 'border-white/5 bg-transparent opacity-40'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg ${
            isActive ? 'animate-pulse_slow' : ''
          }`}
        >
          <Icon size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{config.label}</div>
          <div className="text-xs text-white/40">{label}</div>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
            <span className="text-xs text-white/50">En cours</span>
          </div>
        )}
        {isDone && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400/70">Termine</span>
          </div>
        )}
      </div>

      {/* Bulle de dialogue */}
      <AnimatePresence>
        {(isActive || isDone) && message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-xl p-3 ${config.bg} border ${config.border}`}>
              <p className={`text-xs leading-relaxed text-white/70 ${isActive ? 'typewriter-cursor' : ''}`}>
                {message || '...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
