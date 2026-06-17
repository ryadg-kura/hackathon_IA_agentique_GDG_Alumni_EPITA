import { explorerAgent } from './explorer.js'
import { strategistAgent } from './strategist.js'
import { writerAgent } from './writer.js'
import { redisSafe } from '../lib/redis.js'

export async function runOrchestrator(profile, sessionId, send) {
  // --- Agent 1 : Explorateur ---
  send('agent_start', { agent: 'explorer', label: 'Exploration des formations' })

  const explorerResult = await explorerAgent(
    profile,
    (token) => send('agent_token', { agent: 'explorer', token })
  )

  send('agent_done', {
    agent: 'explorer',
    message: explorerResult.message,
    count: explorerResult.formations.length,
  })

  // --- Agent 2 : Strategiste ---
  send('agent_start', { agent: 'strategist', label: 'Construction de la strategie' })

  let strategy = await strategistAgent(
    profile,
    explorerResult.formations,
    (token) => send('agent_token', { agent: 'strategist', token })
  )

  // Boucle de replanification si la strategie est desequilibree
  if (strategy.gaps.length > 0) {
    send('replan', {
      reason: `Categories manquantes : ${strategy.gaps.join(', ')}. Recherche supplementaire en cours.`,
    })

    const supplement = await explorerAgent(
      profile,
      () => {},
      strategy.gaps
    )

    const combined = [...explorerResult.formations, ...supplement.formations]
    strategy = await strategistAgent(profile, combined, () => {})
  }

  // Envoie les cartes une par une pour l'animation frontend
  for (const formation of strategy.securite) {
    send('card_placed', { category: 'securite', formation })
  }
  for (const formation of strategy.cible) {
    send('card_placed', { category: 'cible', formation })
  }
  for (const formation of strategy.ambition) {
    send('card_placed', { category: 'ambition', formation })
  }

  send('agent_done', {
    agent: 'strategist',
    message: strategy.message,
    counts: {
      securite: strategy.securite.length,
      cible: strategy.cible.length,
      ambition: strategy.ambition.length,
    },
  })

  // --- Agent 3 : Redacteur ---
  send('agent_start', { agent: 'writer', label: 'Redaction des projets motives' })

  const letters = await writerAgent(
    profile,
    strategy,
    (token, formationId) => send('letter_token', { formationId, token })
  )

  send('agent_done', { agent: 'writer', message: 'Projets motives rediges.' })

  // Sauvegarde en Redis (TTL 24h) - optionnel, pas bloquant
  await redisSafe(async (client) => {
    await client.setex(`session:${sessionId}`, 86400, JSON.stringify({
      profile, strategy, letters, createdAt: Date.now(),
    }))
  })

  send('complete', { strategy, letters })
}
