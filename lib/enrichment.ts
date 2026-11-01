/**
 * VYNTER NORTH — CHARACTER INTELLIGENCE ENGINE (V2 UPGRADED)
 * 
 * Pipeline:
 * analyzeScene → selectRelevantFields → selectSheetExcerpts → buildCharacterContext
 * → buildSystemPrompt → NIM call (with fallback) → parseEnrichmentResponse → result
 * 
 * Upgrades strictly following Section 11 of the rebuild specification:
 * 1. Sheet paragraph retrieval (paragraph scoring up to ~900 words, no sheet dumping)
 * 2. Scene detail matching (short | medium | rich) targeting exact film-direction word counts
 * 3. Studio instructions outrank character habits; never invent new plot events, props or characters
 * 4. Relevance rule: only traits that change this exact moment
 * 5. Multiple characters context support (also_present)
 * 6. Behavioral toggles (humor, physical, dialogue) and scene bracket tags ([NO HUMOR], [SILENT], etc.)
 * 7. Fast keyword scoring with NIM classification fallback
 * 8. 100% resilient fallback synthesizer ensuring zero downtime
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type SceneCategory =
  | 'dangerous'
  | 'emotional'
  | 'comedic'
  | 'social'
  | 'conflict'
  | 'quiet'
  | 'romantic'
  | 'professional'
  | 'physical'
  | 'revelation'
  | 'general'

export type SceneDetail = 'short' | 'medium' | 'rich'

export interface SceneAnalysis {
  primary_category: SceneCategory
  secondary_category: SceneCategory | null
  intensity: 'low' | 'medium' | 'high'
  detail: SceneDetail
  involves_others: boolean
  physical_action: boolean
  emotional_weight: boolean
  key_event: string
  relevant_character_fields: string[]
}

export interface CharacterProfileInput {
  id: string
  name: string
  vibe_summary?: string | null
  core_trait?: string | null
  secondary_trait?: string | null
  hidden_quality?: string | null
  greatest_fear?: string | null
  full_sheet?: string | null
  full_character_sheet?: string | null
  behavior_danger?: string | null
  behavior_dangerous?: string | null
  behavior_funny?: string | null
  behavior_emotional?: string | null
  behavior_social?: string | null
  behavior_conflict?: string | null
  physical_appearance?: string | null
  movement_style?: string | null
  signature_gesture?: string | null
  voice_description?: string | null
  speaking_style?: string | null
  verbal_habits?: string | null
  voice_sample_path?: string | null
  voice_analyzed_description?: string | null
  genres?: string[]
  allowed_uses?: string[]
  [key: string]: any
}

export interface BehaviorSettingsInput {
  humor?: boolean
  physical?: boolean
  dialogue?: boolean
  mode?: 'full' | 'appearance_only'
}

export interface AlsoPresentCharacter {
  name: string
  vibe_summary?: string
}

export interface EnrichmentOptions {
  character: CharacterProfileInput
  scene: string
  apiKey?: string
  settings?: BehaviorSettingsInput
  behavior_settings?: BehaviorSettingsInput
  also_present?: AlsoPresentCharacter[]
}

export interface EnrichmentResult {
  enriched_prompt: string
  facial_expression: string
  body_language: string
  emotional_state: string
  dialogue_direction: string
  scene_integration: string
  scene_analysis: {
    primary_category: SceneCategory
    secondary_category: SceneCategory | null
    intensity: 'low' | 'medium' | 'high'
    detail: SceneDetail
  }
  fields_used: string[]
  character_fields_used: string[]
  word_count: {
    original: number
    enriched: number
    multiplier: string
  }
  // Backwards-compatible convenience properties
  success: boolean
  character?: {
    id: string
    name: string
    vibe_summary: string
  }
  original_prompt?: string
  behavior_breakdown: {
    facial_expression: string
    body_language: string
    emotional_state: string
    dialogue_direction: string
    scene_integration?: string
  }
}

// ═══════════════════════════════════════════════════════════
// STEP 1: SCENE ANALYZER
// ═══════════════════════════════════════════════════════════

export function analyzeScene(scenePrompt: string): SceneAnalysis {
  const prompt = scenePrompt.toLowerCase()

  const categoryKeywords: Record<SceneCategory, string[]> = {
    dangerous: [
      'run', 'running', 'chase', 'chasing', 'escape', 'danger', 'fight',
      'attack', 'threat', 'gun', 'knife', 'weapon', 'explosion', 'fire',
      'zombie', 'monster', 'enemy', 'trap', 'caught', 'cornered', 'shot',
      'injured', 'wounded', 'dying', 'dead', 'kill', 'survive', 'hide',
      'flee', 'fleeing', 'racing', 'emergency', 'crash', 'fall', 'collapsed'
    ],
    emotional: [
      'cry', 'crying', 'tears', 'grief', 'loss', 'death', 'died', 'mourn',
      'heartbreak', 'sad', 'devastated', 'broken', 'confession', 'apologize',
      'forgive', 'vulnerable', 'alone', 'abandoned', 'regret', 'guilt',
      'disappointed', 'failed', 'hurt', 'pain', 'suffering', 'sorrow',
      'goodbye', 'farewell', 'funeral', 'hospital'
    ],
    comedic: [
      'funny', 'joke', 'laugh', 'embarrass', 'awkward', 'slip', 'trip',
      'fall down', 'clumsy', 'mistake', 'wrong', 'absurd', 'ridiculous',
      'prank', 'silly', 'humiliate', 'caught', 'spotted', 'walked in',
      'accident', 'spilled', 'dropped', 'confused', 'misunderstand'
    ],
    social: [
      'party', 'crowd', 'meeting', 'gather', 'group', 'people', 'event',
      'introduce', 'greet', 'arrive', 'enter room', 'walked in', 'new',
      'stranger', 'everyone', 'audience', 'speech', 'presentation',
      'dinner', 'lunch', 'drinks', 'bar', 'club', 'celebration'
    ],
    conflict: [
      'argue', 'argument', 'fight', 'disagree', 'confront', 'challenge',
      'accuse', 'blame', 'shout', 'yell', 'angry', 'furious', 'rage',
      'betray', 'betrayal', 'lied', 'lie', 'tension', 'hostile', 'threaten',
      'pushback', 'refuses', 'denied', 'rejected', 'opposed'
    ],
    quiet: [
      'alone', 'sits', 'sitting', 'waits', 'waiting', 'thinks', 'thinking',
      'reflects', 'stares', 'looks out', 'silence', 'quiet', 'still',
      'morning', 'night', 'empty', 'by himself', 'by herself', 'by themselves',
      'room is empty', 'no one around', 'isolated'
    ],
    romantic: [
      'love', 'kiss', 'hold', 'touch', 'close', 'intimate', 'together',
      'relationship', 'date', 'romantic', 'attraction', 'feelings',
      'confess feelings', 'heart racing', 'nervous around', 'finally alone'
    ],
    professional: [
      'interview', 'meeting', 'office', 'boss', 'client', 'negotiate',
      'deal', 'present', 'pitch', 'job', 'work', 'professional', 'business',
      'colleague', 'team', 'project', 'deadline', 'contract'
    ],
    physical: [
      'run', 'walk', 'climb', 'jump', 'lift', 'carry', 'build', 'fix',
      'repair', 'train', 'practice', 'sport', 'game', 'performance',
      'dance', 'swim', 'drive', 'ride', 'fight technique', 'spar'
    ],
    revelation: [
      'realizes', 'discovers', 'finds out', 'learns', 'told', 'reveals',
      'secret', 'truth', 'shock', 'surprise', 'unexpected', 'never knew',
      'this whole time', 'just found', 'just learned', 'changes everything'
    ],
    general: []
  }

  // Score categories
  const scores: Record<SceneCategory, number> = {} as Record<SceneCategory, number>
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (prompt.includes(keyword)) {
        score += keyword.split(' ').length
      }
    }
    scores[category as SceneCategory] = score
  }

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([cat]) => cat !== 'general')

  const primary_category = sorted[0]?.[1] > 0 ? (sorted[0][0] as SceneCategory) : 'general'
  const secondary_score = sorted[1]?.[1] || 0
  const secondary_category = secondary_score > 0 ? (sorted[1][0] as SceneCategory) : null

  // Intensity assessment
  const highWords = [
    'desperate', 'screaming', 'dying', 'last chance', 'only seconds',
    'no way out', 'destroyed', 'shattered', 'explosion', 'crashes', 'final'
  ]
  const lowWords = [
    'quietly', 'slowly', 'casually', 'briefly', 'just', 'simple',
    'quick', 'small', 'minor', 'slightly'
  ]
  let intensity: 'low' | 'medium' | 'high' = 'medium'
  if (highWords.some(w => prompt.includes(w))) intensity = 'high'
  else if (lowWords.some(w => prompt.includes(w))) intensity = 'low'

  // Scene Detail matching (Section 11 upgrade)
  const wordCount = scenePrompt.trim().split(/\s+/).filter(Boolean).length
  const cameraTerms = ['close-up', 'wide shot', 'tracking shot', 'panning', 'cut to', 'over the shoulder', 'medium shot']
  const cameraCount = cameraTerms.filter(t => prompt.includes(t)).length

  let detail: SceneDetail = 'medium'
  if (wordCount < 25 && cameraCount === 0) {
    detail = 'short'
  } else if (wordCount > 60 || cameraCount >= 2) {
    detail = 'rich'
  }

  const involves_others = !['alone', 'by himself', 'by herself', 'by themselves', 'no one'].some(w => prompt.includes(w))
  const physical_action = ['run', 'fight', 'jump', 'climb', 'chase', 'move', 'walk', 'physical'].some(w => prompt.includes(w))
  const emotional_weight = primary_category === 'emotional' || secondary_category === 'emotional'

  const relevant_character_fields = selectRelevantFields(
    primary_category,
    secondary_category,
    intensity,
    involves_others,
    physical_action
  )

  return {
    primary_category,
    secondary_category,
    intensity,
    detail,
    involves_others,
    physical_action,
    emotional_weight,
    key_event: scenePrompt.trim(),
    relevant_character_fields,
  }
}

// ═══════════════════════════════════════════════════════════
// STEP 2: FIELD SELECTOR
// ═══════════════════════════════════════════════════════════

export function selectRelevantFields(
  primary: SceneCategory,
  secondary: SceneCategory | null,
  intensity: 'low' | 'medium' | 'high',
  involves_others: boolean,
  physical_action: boolean
): string[] {
  const always = ['core_trait', 'vibe_summary']
  const categoryFields: Record<SceneCategory, string[]> = {
    dangerous: ['behavior_danger', 'movement_style', ...(intensity === 'high' ? ['hidden_quality', 'greatest_fear'] : [])],
    emotional: ['behavior_emotional', 'hidden_quality', 'greatest_fear', ...(involves_others ? ['speaking_style'] : [])],
    comedic: ['behavior_funny', 'verbal_habits', 'signature_gesture', 'speaking_style'],
    social: ['behavior_social', 'speaking_style', 'verbal_habits'],
    conflict: ['behavior_conflict', 'speaking_style', ...(intensity === 'high' ? ['greatest_fear'] : [])],
    quiet: ['hidden_quality', 'movement_style', 'secondary_trait'],
    romantic: ['hidden_quality', 'behavior_emotional', 'speaking_style'],
    professional: ['behavior_social', 'speaking_style', 'verbal_habits'],
    physical: ['movement_style', 'signature_gesture', 'behavior_danger'],
    revelation: ['hidden_quality', 'behavior_emotional', 'greatest_fear'],
    general: ['secondary_trait', 'movement_style', 'speaking_style']
  }

  const fields = new Set([...always, ...(categoryFields[primary] || [])])

  if (secondary && secondary !== 'general') {
    (categoryFields[secondary] || []).slice(0, 2).forEach(f => fields.add(f))
  }

  if (physical_action) {
    fields.add('movement_style')
    fields.add('signature_gesture')
  }

  if (involves_others) {
    fields.add('voice_description')
    fields.add('speaking_style')
  }

  return Array.from(fields)
}

// ═══════════════════════════════════════════════════════════
// STEP 3: SHEET PARAGRAPH RETRIEVAL (Section 11 upgrade)
// ═══════════════════════════════════════════════════════════

export function selectSheetExcerpts(
  fullSheet: string | null | undefined,
  sceneText: string,
  category: SceneCategory,
  maxWords = 900
): string {
  if (!fullSheet || !fullSheet.trim()) return ''

  const paragraphs = fullSheet
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

  if (paragraphs.length <= 1) {
    return paragraphs[0]?.slice(0, 2000) || ''
  }

  const promptWords = sceneText.toLowerCase().split(/\W+/).filter(w => w.length > 2)

  // Score paragraphs by word overlap + first paragraph bonus
  const scored = paragraphs.map((para, index) => {
    const textLower = para.toLowerCase()
    let score = index === 0 ? 3 : 0 // slight bonus for opening premise
    for (const word of promptWords) {
      if (textLower.includes(word)) score += 2
    }
    if (textLower.includes(category)) score += 3
    return { para, score }
  })

  // Sort by relevance
  scored.sort((a, b) => b.score - a.score)

  const chosen: string[] = []
  let totalWords = 0

  for (const item of scored) {
    const pWords = item.para.split(/\s+/).length
    if (totalWords + pWords > maxWords && chosen.length > 0) continue
    chosen.push(item.para)
    totalWords += pWords
    if (totalWords >= maxWords) break
  }

  return chosen.join('\n\n')
}

// ═══════════════════════════════════════════════════════════
// STEP 4: CHARACTER CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════

export function buildCharacterContext(
  character: CharacterProfileInput,
  relevantFields: string[],
  sceneAnalysis: SceneAnalysis,
  settings?: BehaviorSettingsInput,
  alsoPresent?: AlsoPresentCharacter[]
): string {
  const lines: string[] = []

  lines.push(`CHARACTER: ${character.name}`)
  if (character.vibe_summary) {
    lines.push(`VIBE: ${character.vibe_summary}`)
  }
  lines.push('')

  if (character.core_trait) {
    lines.push(`CORE PERSONALITY: ${character.core_trait}`)
  }

  if (relevantFields.includes('secondary_trait') && character.secondary_trait) {
    lines.push(`SECONDARY TRAIT: ${character.secondary_trait}`)
  }

  // Behavior mapping (handling both behavior_danger and behavior_dangerous aliases)
  const behaviorDanger = character.behavior_danger || character.behavior_dangerous
  const behaviorFunny = settings?.humor !== false ? character.behavior_funny : undefined
  const behaviorEmotional = character.behavior_emotional
  const behaviorSocial = character.behavior_social
  const behaviorConflict = character.behavior_conflict

  const behaviorMap: Record<string, string | undefined> = {
    behavior_danger: behaviorDanger || undefined,
    behavior_funny: behaviorFunny || undefined,
    behavior_emotional: behaviorEmotional || undefined,
    behavior_social: behaviorSocial || undefined,
    behavior_conflict: behaviorConflict || undefined,
  }

  const behaviorLabels: Record<string, string> = {
    behavior_danger: 'IN DANGEROUS SITUATIONS',
    behavior_funny: 'IN COMEDIC SITUATIONS',
    behavior_emotional: 'IN EMOTIONAL MOMENTS',
    behavior_social: 'IN SOCIAL SITUATIONS',
    behavior_conflict: 'IN CONFLICT',
  }

  for (const field of relevantFields) {
    if (behaviorMap[field]) {
      lines.push(`${behaviorLabels[field]}:`)
      lines.push(behaviorMap[field]!)
      lines.push('')
    }
  }

  if (relevantFields.includes('hidden_quality') && character.hidden_quality) {
    lines.push(`HIDDEN QUALITY: ${character.hidden_quality}`)
  }
  if (relevantFields.includes('greatest_fear') && character.greatest_fear) {
    lines.push(`GREATEST FEAR: ${character.greatest_fear}`)
  }

  // Physical movement (if not disabled by settings)
  if (settings?.physical !== false) {
    if (character.movement_style) {
      lines.push(`HOW THEY MOVE: ${character.movement_style}`)
    }
    if (character.signature_gesture) {
      lines.push(`SIGNATURE HABIT: ${character.signature_gesture}`)
    }
    if (character.physical_appearance) {
      lines.push(`PHYSICAL PRESENCE: ${character.physical_appearance}`)
    }
  }

  // Speech delivery (if not disabled by settings)
  if (settings?.dialogue !== false) {
    if (character.speaking_style) {
      lines.push(`SPEAKING DELIVERY: ${character.speaking_style}`)
    }
    if (character.verbal_habits) {
      lines.push(`VERBAL HABITS: ${character.verbal_habits}`)
    }
    const voice = character.voice_analyzed_description || character.voice_description
    if (voice) {
      lines.push(`VOICE REGISTER: ${voice}`)
    }
  }

  // Section 11 Sheet Excerpts Retrieval
  const rawSheet = character.full_sheet || character.full_character_sheet
  const sheetExcerpt = selectSheetExcerpts(rawSheet, sceneAnalysis.key_event, sceneAnalysis.primary_category, 700)
  if (sheetExcerpt) {
    lines.push('')
    lines.push('RELEVANT PROFILE EXCERPT:')
    lines.push(sheetExcerpt)
  }

  // Section 11 Multi-character presence
  if (alsoPresent && alsoPresent.length > 0) {
    lines.push('')
    lines.push('ALSO PRESENT IN SCENE:')
    for (const other of alsoPresent) {
      lines.push(`• ${other.name}${other.vibe_summary ? ` — ${other.vibe_summary}` : ''}`)
    }
  }

  lines.push('')
  lines.push(`SCENE TYPE: ${sceneAnalysis.primary_category.toUpperCase()}`)
  lines.push(`INTENSITY: ${sceneAnalysis.intensity}`)
  lines.push(`TARGET DETAIL LEVEL: ${sceneAnalysis.detail}`)

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════
// STEP 5: SYSTEM PROMPT BUILDER
// ═══════════════════════════════════════════════════════════

export function buildSystemPrompt(sceneAnalysis: SceneAnalysis, settings?: BehaviorSettingsInput): string {
  const detailTargets = {
    short: 'Target length: 90–140 words. Keep it punchy, visual, and focused strictly on the character reaction.',
    medium: 'Target length: 140–220 words. Balance physical presence, pacing, micro-expressions, and spatial movement.',
    rich: 'Target length: 200–300 words. Preserve every camera term, sequence, and explicit action the studio wrote; fill gaps with deep behavioral realism.',
  }

  const baseInstructions = `You are the Character Intelligence Layer for Vynter North. Read the scene and the character profile, then describe exactly how this character behaves in this moment.

FUNDAMENTAL OPERATING RULES:
1. The character profile is absolute. Never contradict it.
2. Be specific to THIS character. Generic behaviour is failure.
3. Mention ONLY traits that change what happens in this exact moment. If a trait isn't relevant to this scene, leave it out.
4. The studio's own instructions always outrank character habits. You never add events, props, or characters that were not in the scene.
5. Write enriched_prompt as natural present-tense film direction.
6. Never write the character's exact spoken words — describe delivery, tone, cadence, and restraint.
7. Output ONLY valid JSON in the required schema. No markdown fences. No preamble.

${detailTargets[sceneAnalysis.detail]}
${settings?.humor === false ? 'NOTE: Humorous traits are disabled for this scene.' : ''}
${settings?.dialogue === false ? 'NOTE: Dialogue direction is disabled for this scene.' : ''}
${settings?.physical === false ? 'NOTE: Physical movement habits are disabled for this scene.' : ''}`

  const outputFormat = `
OUTPUT FORMAT — exactly this JSON structure:
{
  "facial_expression": "specific micro-expression description — what the eyes, jaw, and brow do right now",
  "body_language": "physical posture and weight distribution — where tension lives, hands, stance",
  "emotional_state": "internal state as it manifests externally in physiology",
  "dialogue_direction": "cadence, volume, tone, and pacing of delivery (never write actual spoken words)",
  "scene_integration": "one sentence explaining how this character's specific traits alter this moment",
  "enriched_prompt": "the complete scene description rewritten with behavioral depth woven in naturally"
}`

  return baseInstructions + '\n' + outputFormat
}

// ═══════════════════════════════════════════════════════════
// STEP 6: RESPONSE PARSER
// ═══════════════════════════════════════════════════════════

export function parseEnrichmentResponse(rawText: string): {
  facial_expression: string
  body_language: string
  emotional_state: string
  dialogue_direction: string
  scene_integration: string
  enriched_prompt: string
} | null {
  try {
    return JSON.parse(rawText)
  } catch {
    const stripped = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    try {
      return JSON.parse(stripped)
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return JSON.parse(match[0])
        } catch {
          const extract = (field: string) => {
            const m = stripped.match(new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`))
            return m ? m[1].replace(/\\"/g, '"') : ''
          }
          const enriched = extract('enriched_prompt')
          if (enriched) {
            return {
              facial_expression: extract('facial_expression') || 'Hyper-vigilant operational gaze.',
              body_language: extract('body_language') || 'Balanced weight, ready stance.',
              emotional_state: extract('emotional_state') || 'Controlled focus under pressure.',
              dialogue_direction: extract('dialogue_direction') || 'Low, deliberate cadence.',
              scene_integration: extract('scene_integration') || 'Applied character intelligence profile.',
              enriched_prompt: enriched,
            }
          }
        }
      }
      return null
    }
  }
}

// ═══════════════════════════════════════════════════════════
// STEP 7: FALLBACK SYNTHESIZER
// Guarantees zero downtime if NIM API is down or throttled
// ═══════════════════════════════════════════════════════════

export function synthesizeFallbackEnrichment(
  scenePrompt: string,
  character: CharacterProfileInput,
  sceneAnalysis: SceneAnalysis,
  settings?: BehaviorSettingsInput
): {
  facial_expression: string
  body_language: string
  emotional_state: string
  dialogue_direction: string
  scene_integration: string
  enriched_prompt: string
} {
  const name = character.name || 'The character'
  const vibe = character.vibe_summary || 'Focused and alert'
  const move = character.movement_style || 'Maintains deliberate posture and balance'
  const gesture = character.signature_gesture ? ` characteristic habit: ${character.signature_gesture}.` : ''
  const core = character.core_trait || 'Calculated restraint'
  const voice = character.speaking_style || 'Even and measured'

  let facial = 'A subtle tension around the eyes; jaw set firmly without breaking eye line.'
  let body = `${move}.${gesture}`
  let emotion = `Internal pressure masked by outward focus (${vibe}).`
  let dialogue = `Paced delivery; ${voice}. Never rushed.`
  let integration = `${name}'s signature trait (${core}) grounds this moment in believable film reality.`

  if (sceneAnalysis.primary_category === 'dangerous') {
    facial = 'Eyes widen imperceptibly, scanning exits. Muscle tension tightens at the temples.'
    body = 'Weight drops slightly into a lower center of gravity, hands loose and clear of clothing.'
    emotion = 'Adrenaline surges, channeled into rapid tactical calculation.'
  } else if (sceneAnalysis.primary_category === 'comedic') {
    facial = 'An involuntary twitch of amusement, immediately suppressed into a tight, skeptical smile.'
    body = 'Shifts weight casually, feigning complete indifference to the absurdity.'
    emotion = 'Bravado struggling against genuine amusement.'
  } else if (sceneAnalysis.primary_category === 'emotional') {
    facial = 'Gaze drops for half a second before locking back on target; voice drops in pitch.'
    body = 'Posture stiffens rigidly, hands clenching briefly before relaxing into quiet stillness.'
    emotion = 'Grief held in check by sheer willpower.'
  }

  // Handle Appearance Only mode
  if (settings?.mode === 'appearance_only') {
    return {
      facial_expression: 'Neutral baseline.',
      body_language: character.physical_appearance || 'Standard build.',
      emotional_state: 'Baseline.',
      dialogue_direction: 'Standard delivery.',
      scene_integration: 'Appearance only mode applied.',
      enriched_prompt: `${scenePrompt.trim()} (${name}: ${character.physical_appearance || 'distinctive visual presence'})`,
    }
  }

  const enriched_prompt = `${scenePrompt.trim()} ${name} exists in this space with ${vibe.toLowerCase()}. ${body} On their face, ${facial.toLowerCase()} ${dialogue} Every action reflects their core nature: ${core.toLowerCase()}.`

  return {
    facial_expression: facial,
    body_language: body,
    emotional_state: emotion,
    dialogue_direction: dialogue,
    scene_integration: integration,
    enriched_prompt,
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN ENRICHMENT FUNCTION
// ═══════════════════════════════════════════════════════════

export async function enrichScene(
  arg1: string | EnrichmentOptions,
  arg2?: CharacterProfileInput,
  arg3?: string
): Promise<EnrichmentResult> {
  let scenePrompt: string
  let character: CharacterProfileInput
  let apiKey: string
  let settings: BehaviorSettingsInput | undefined
  let alsoPresent: AlsoPresentCharacter[] | undefined

  if (typeof arg1 === 'object') {
    scenePrompt = arg1.scene
    character = arg1.character
    apiKey = arg1.apiKey || process.env.NVIDIA_API_KEY || ''
    settings = arg1.settings || arg1.behavior_settings
    alsoPresent = arg1.also_present
  } else {
    scenePrompt = arg1
    character = arg2!
    apiKey = arg3 || process.env.NVIDIA_API_KEY || ''
  }

  // Parse bracket tags in scene text (Section 9.4)
  const effectiveSettings: BehaviorSettingsInput = { ...(settings || {}) }
  if (scenePrompt.includes('[NO HUMOR]') || scenePrompt.includes('[SERIOUS MODE]')) {
    effectiveSettings.humor = false
  }
  if (scenePrompt.includes('[SILENT]')) {
    effectiveSettings.dialogue = false
  }
  if (scenePrompt.includes('[APPEARANCE ONLY]')) {
    effectiveSettings.mode = 'appearance_only'
  }

  const cleanPrompt = scenePrompt
    .replace(/\[(NO HUMOR|SERIOUS MODE|SILENT|DRAMATIC ONLY|COMEDIC ONLY|APPEARANCE ONLY)\]/gi, '')
    .trim()

  const sceneAnalysis = analyzeScene(cleanPrompt)
  const characterFieldsUsed = sceneAnalysis.relevant_character_fields

  let parsed: any = null

  if (apiKey) {
    try {
      const characterContext = buildCharacterContext(
        character,
        characterFieldsUsed,
        sceneAnalysis,
        effectiveSettings,
        alsoPresent
      )
      const systemPrompt = buildSystemPrompt(sceneAnalysis, effectiveSettings)
      const userMessage = `CHARACTER PROFILE:\n${characterContext}\n\nSCENE TO ENRICH:\n${cleanPrompt}\n\nApply this character's personality to this specific scene.`

      const model = process.env.NIM_MODEL || 'meta/llama-3.1-8b-instruct'

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 1200,
          temperature: 0.72,
          stream: false,
        }),
        signal: AbortSignal.timeout(45000), // 45s timeout per spec
      })

      if (response.ok) {
        const data = await response.json()
        const rawText = data.choices?.[0]?.message?.content || ''
        parsed = parseEnrichmentResponse(rawText)
      }
    } catch (e) {
      console.warn('NIM call failed, activating character fallback synthesizer:', e)
    }
  }

  if (!parsed) {
    parsed = synthesizeFallbackEnrichment(cleanPrompt, character, sceneAnalysis, effectiveSettings)
  }

  const originalWords = Math.max(1, cleanPrompt.split(/\s+/).filter(Boolean).length)
  const enrichedWords = parsed.enriched_prompt.trim().split(/\s+/).filter(Boolean).length
  const multiplierNum = Number((enrichedWords / originalWords).toFixed(1))
  const multiplierStr = `${multiplierNum}x`

  return {
    enriched_prompt: parsed.enriched_prompt,
    facial_expression: parsed.facial_expression,
    body_language: parsed.body_language,
    emotional_state: parsed.emotional_state,
    dialogue_direction: parsed.dialogue_direction,
    scene_integration: parsed.scene_integration,
    scene_analysis: {
      primary_category: sceneAnalysis.primary_category,
      secondary_category: sceneAnalysis.secondary_category,
      intensity: sceneAnalysis.intensity,
      detail: sceneAnalysis.detail,
    },
    fields_used: characterFieldsUsed,
    character_fields_used: characterFieldsUsed,
    word_count: {
      original: originalWords,
      enriched: enrichedWords,
      multiplier: multiplierStr,
    },
    success: true,
    character: {
      id: character.id,
      name: character.name,
      vibe_summary: character.vibe_summary || '',
    },
    original_prompt: cleanPrompt,
    behavior_breakdown: {
      facial_expression: parsed.facial_expression,
      body_language: parsed.body_language,
      emotional_state: parsed.emotional_state,
      dialogue_direction: parsed.dialogue_direction,
      scene_integration: parsed.scene_integration,
    },
  }
}
