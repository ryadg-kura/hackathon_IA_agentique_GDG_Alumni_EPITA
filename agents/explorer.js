import { llm, MODEL } from '../lib/llm.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const allFormations = JSON.parse(
  readFileSync(path.join(__dirname, '../data/formations.json'), 'utf-8')
)

export async function explorerAgent(profile, onToken, missingCategories = []) {
  const regionKeyword = profile.contraintes?.geo?.split('-')[0] ?? ''
  const prefiltered = allFormations.filter((f) =>
    !regionKeyword || f.region.toLowerCase().includes(regionKeyword.toLowerCase())
  )

  const gapContext = missingCategories.length > 0
    ? `\nATTENTION : la strategie precedente manque des formations dans : ${missingCategories.join(', ')}. Priorise des formations qui comblent ces categories.`
    : ''

  const prompt = `Tu es un agent explorateur de formations Parcoursup.

Profil etudiant :
${JSON.stringify(profile, null, 2)}

Formations disponibles :
${JSON.stringify(prefiltered, null, 2)}
${gapContext}

Selectionne exactement 10 formations pertinentes pour ce profil.
Criteres : adequation filiere, localisation, niveau (compare notes_bac_mediane avec les notes de l'etudiant), interets declares, contraintes (budget public/prive, alternance).

Reponds uniquement avec du JSON valide, sans texte avant ou apres :
{
  "message": "phrase courte decrivant ta selection (max 20 mots)",
  "formations": [
    { "id": "...", "nom": "...", "etablissement": "...", "raison": "raison courte adaptee a ce profil" }
  ]
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
    message: parsed.message ?? 'Exploration terminee.',
    formations: parsed.formations ?? [],
  }
}

function extractJSON(text) {
  const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Explorer: reponse JSON invalide')
  return match[0]
}
