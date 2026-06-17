import { llm, MODEL } from '../lib/llm.js'

export async function writerAgent(profile, strategy, onToken) {
  const allFormations = [
    ...strategy.securite,
    ...strategy.cible,
    ...strategy.ambition,
  ].slice(0, 6)

  const letters = {}

  for (const formation of allFormations) {
    const prompt = `Tu es un agent redacteur de projets de formation motives pour Parcoursup.

Profil etudiant :
${JSON.stringify(profile, null, 2)}

Formation cible : ${formation.nom} - ${formation.etablissement}
Pourquoi cette formation a ete selectionnee : ${formation.justification}

Redige un projet de formation motive de 120 a 150 mots.
Contraintes absolues :
- Personnel et specifique a cette formation, jamais generique
- Met en valeur les points forts du profil en lien direct avec la formation
- Ton naturel, sincere, pas scolaire
- Aucun smiley, aucun tiret long, aucune formule bateau type "passionne depuis toujours"
- Commence directement par le fond, pas par une introduction sur soi`

    const stream = await llm.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    })

    let letter = ''
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? ''
      if (token) {
        letter += token
        onToken(token, formation.id)
      }
    }

    letters[formation.id] = letter
  }

  return letters
}
