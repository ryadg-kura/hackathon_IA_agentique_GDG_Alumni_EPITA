import { useState } from 'react'
import { motion } from 'framer-motion'

const SPECIALITES = [
  'Mathematiques', 'NSI', 'Physique-Chimie', 'SVT',
  'SES', 'Histoire-Geo', 'Philosophie', 'Langues',
  'Arts', 'EPS', 'Humanites',
]

const DEFAULT_PROFILE = {
  bac: 'general',
  specialites: ['Mathematiques', 'NSI'],
  notes: {
    Mathematiques: 14,
    NSI: 16,
    Francais_anticipe: 12,
    moyenne_generale: 13.5,
  },
  interets: ['informatique', 'jeux video', 'resolution de problemes'],
  contraintes: {
    geo: 'Ile-de-France',
    budget: 'public_prive',
    alternance: false,
  },
  ambition: "viser une ecole d'ingenieur en informatique ou IA",
}

export default function ProfileForm({ onStart }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [interetInput, setInteretInput] = useState('')

  const updateNote = (key, value) => {
    setProfile((p) => ({ ...p, notes: { ...p.notes, [key]: parseFloat(value) || 0 } }))
  }

  const toggleSpecialite = (s) => {
    setProfile((p) => {
      const has = p.specialites.includes(s)
      return {
        ...p,
        specialites: has
          ? p.specialites.filter((x) => x !== s)
          : [...p.specialites, s].slice(0, 3),
      }
    })
  }

  const addInteret = (e) => {
    if (e.key === 'Enter' && interetInput.trim()) {
      setProfile((p) => ({ ...p, interets: [...p.interets, interetInput.trim()] }))
      setInteretInput('')
    }
  }

  const removeInteret = (i) => {
    setProfile((p) => ({ ...p, interets: p.interets.filter((_, idx) => idx !== i) }))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Construis ta{' '}
          <span className="text-gradient">strategie Parcoursup</span>
        </h1>
        <p className="text-white/40 text-sm mb-10">
          Trois agents IA analysent ton profil et construisent une strategie de voeux personnalisee.
        </p>

        <div className="space-y-8">
          {/* Notes */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Notes
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile.notes).map(([key, val]) => (
                <div key={key}>
                  <label className="text-xs text-white/40 mb-1 block">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={val}
                    onChange={(e) => updateNote(key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Specialites */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Specialites (max 3)
            </h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALITES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSpecialite(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    profile.specialites.includes(s)
                      ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Interets */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Interets
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.interets.map((i, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-2"
                >
                  {i}
                  <button onClick={() => removeInteret(idx)} className="text-purple-400 hover:text-white">
                    x
                  </button>
                </span>
              ))}
            </div>
            <input
              value={interetInput}
              onChange={(e) => setInteretInput(e.target.value)}
              onKeyDown={addInteret}
              placeholder="Ajoute un interet (Entree pour valider)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </section>

          {/* Contraintes */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Contraintes
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Region preferee</label>
                <input
                  value={profile.contraintes.geo}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      contraintes: { ...p.contraintes, geo: e.target.value },
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      contraintes: {
                        ...p.contraintes,
                        alternance: !p.contraintes.alternance,
                      },
                    }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    profile.contraintes.alternance ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      profile.contraintes.alternance ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className="text-sm text-white/60">Alternance uniquement</span>
              </label>
            </div>
          </section>

          {/* Ambition */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Objectif a terme
            </h2>
            <textarea
              value={profile.ambition}
              onChange={(e) => setProfile((p) => ({ ...p, ambition: e.target.value }))}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </section>

          <motion.button
            onClick={() => onStart(profile)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            Lancer l'analyse
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
