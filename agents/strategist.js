import { llm, MODEL } from '../lib/llm.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const allFormations = JSON.parse(
  readFileSync(path.join(__dirname, '../data/formations.json'), 'utf-8')
)

export async function strategistAgent(profile, candidates, onToken) {
  const candidatesWithData = candidates.map((c) => {
    const full = allFormations.find((f) => f.id === c.id) ?? {}
    return { ...full, ...c }
  })

  const prompt = `Tu es un agent strategiste d'orientation Parcoursup.

Profil etudiant :
${JSON.stringify(profile, null, 2)}

Formations candidates avec donnees officielles :
${JSON.stringify(candidatesWithData, null, 2)}

Pour chaque formation, estime le taux d'acces probable pour CE profil specifique (pas le taux general).
Classe les formations dans 3 categories equilibrees :
- securite : probabilite d'acces > 65 % pour ce profil
- cible : probabilite d'acces entre 30 % et 65 %
- ambition : probabilite d'acces < 30 % mais correspondant aux objectifs

Regles :
- Minimum 2 formations par categorie
- Si impossible, indique les categories manquantes dans "gaps"
- Justifie chaque classement en lien DIRECT avec le profil de l'etudiant

Reponds uniquement avec du JSON valide :
{
  "message": "phrase courte decrivant la strategie (max 20 mots)",
  "securite": [
    { "id": "...", "nom": "...", "etablissement": "...", "tauxEstime": 75, "justification": "..." }
  ],
  "cible": [...],
  "ambition": [...],
  "gaps": []
}`

  const stream = await llm.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? ''
    if (token) {
      fullText += token
      onToken(token)
    }
  }

  const parsed = JSON.parse(extractJSON(fullText))
  return {
    message: parsed.message ?? 'Strategie construite.',
    securite: parsed.securite ?? [],
    cible: parsed.cible ?? [],
    ambition: parsed.ambition ?? [],
    gaps: parsed.gaps ?? [],
  }
}

function extractJSON(text) {
  const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Strategist: reponse JSON invalide')
  return match[0]
}
