// state: 'idle' | 'talking' | 'thinking' | 'excited'
export default function Aria({ state = 'idle' }) {
  return (
    <div className="aria-wrap">
      <div className={`aria-aura ${state}`} />
      <div className={`aria-ring aria-ring-3`} />
      <div className={`aria-ring aria-ring-2 ${state}`} />
      <div className={`aria-ring aria-ring-1 ${state}`} />

      <div className={`aria-core ${state}`}>
        <div className="aria-eyes">
          <div className={`aria-eye ${state}`} />
          <div className={`aria-eye ${state}`} />
        </div>
      </div>

      {state === 'talking' && (
        <div style={{ position: 'absolute', bottom: -36 }}>
          <div className="voice-wave">
            {[...Array(7)].map((_, i) => <span key={i} />)}
          </div>
        </div>
      )}

      {state === 'thinking' && (
        <div style={{
          position: 'absolute',
          bottom: -32,
          display: 'flex',
          gap: 6,
          alignItems: 'center'
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#f59e0b',
                opacity: 0.7,
                animation: `voice-bar 0.6s ease-in-out ${i * 0.2}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
