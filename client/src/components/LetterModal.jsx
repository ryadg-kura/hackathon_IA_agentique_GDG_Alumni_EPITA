import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const CATEGORY_LABELS = {
  securite: { label: 'Securite', color: 'text-emerald-400' },
  cible: { label: 'Cible', color: 'text-blue-400' },
  ambition: { label: 'Ambition', color: 'text-purple-400' },
}

export default function LetterModal({ formation, category, letter, onClose }) {
  const [copied, setCopied] = useState(false)
  const style = CATEGORY_LABELS[category] ?? {}

  const handleCopy = () => {
    navigator.clipboard.writeText(letter ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase tracking-widest ${style.color}`}>
                  {style.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{formation.nom}</h3>
              <p className="text-sm text-white/40">{formation.etablissement}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Lettre */}
          <div className="p-6">
            <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
              Projet de formation motive
            </div>
            {letter ? (
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                {letter}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-white/30">
                <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                <span className="text-sm">Redaction en cours...</span>
              </div>
            )}
          </div>

          {/* Footer */}
          {letter && (
            <div className="px-6 pb-6">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/60 hover:text-white transition-all"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copie !' : 'Copier le texte'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
