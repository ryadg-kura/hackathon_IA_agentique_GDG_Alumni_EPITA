import AriaChat from './components/AriaChat.jsx'

// Particles de fond - purement decoratif
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  left: Math.random() * 100,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 10,
}))

export default function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#07070f' }}>
      {/* Fond etoile */}
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

      {/* Gradient ambiance */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <AriaChat />
    </div>
  )
}
