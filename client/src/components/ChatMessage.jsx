import { motion } from 'framer-motion'

const CATEGORY_CONFIG = {
  securite: { label: 'Securite', color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
  cible:    { label: 'Cible',    color: '#60a5fa', glow: 'rgba(96,165,250,0.2)' },
  ambition: { label: 'Ambition', color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
}

export default function ChatMessage({ msg, onCardClick }) {
  const isAria = msg.from === 'aria'

  if (msg.type === 'formation') {
    const cfg = CATEGORY_CONFIG[msg.category] ?? CATEGORY_CONFIG.cible
    return (
      <motion.div
        initial={{ opacity: 0, x: -30, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={() => onCardClick?.(msg.formation, msg.category)}
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`,
          border: `1px solid ${cfg.color}30`,
          boxShadow: `0 0 24px ${cfg.glow}, inset 0 0 20px rgba(255,255,255,0.01)`,
          borderRadius: 16,
          padding: '14px 18px',
          cursor: 'pointer',
          maxWidth: 380,
          marginLeft: 0,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${cfg.glow}` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: cfg.color,
            padding: '2px 10px',
            borderRadius: 999,
            border: `1px solid ${cfg.color}50`,
            background: `${cfg.color}15`,
          }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>
          {msg.formation.nom}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginBottom: 10 }}>
          {msg.formation.etablissement}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${msg.formation.tauxEstime ?? 0}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', background: cfg.color, borderRadius: 4 }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color, minWidth: 36 }}>
            {msg.formation.tauxEstime ?? '?'}%
          </span>
        </div>

        {msg.formation.justification && (
          <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginTop: 8, lineHeight: 1.5 }}>
            {msg.formation.justification}
          </p>
        )}

        <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.2)', marginTop: 10 }}>
          Appuie pour voir le projet motive
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        display: 'flex',
        justifyContent: isAria ? 'flex-start' : 'flex-end',
      }}
    >
      <div
        className={isAria ? 'msg-aria' : 'msg-user'}
        style={{
          maxWidth: '72%',
          padding: '10px 16px',
          fontSize: 14,
          lineHeight: 1.6,
          color: isAria ? '#e2e8f0' : 'rgba(226,232,240,0.85)',
        }}
      >
        {msg.text}
      </div>
    </motion.div>
  )
}
