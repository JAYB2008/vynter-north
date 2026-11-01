/**
 * VYNTER NORTH — CHARACTER INTELLIGENCE ENGINE
 * 
 * This file is the brain of the enrichment system.
 * It lives at /lib/enrichment.ts in the Next.js project.
 * 
 * What it does:
 * 1. Analyzes the studio's scene prompt
 * 2. Classifies what kind of scene it is
 * 3. Selects only the relevant parts of the character sheet
 * 4. Builds a focused prompt for the AI model
 * 5. Returns precise behavioral instructions — not a dump of everything
 * 
 * The result: Cairo in a zombie chase gets action/stress traits applied.
 * Cairo at a party gets social/humor traits applied.
 * Cairo in a quiet emotional moment gets his hidden quality applied.
 * Never everything at once. Always what is relevant to the scene.
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type SceneCategory =
  | 'dangerous'      // action, chase, fight, survival, threat
  | 'emotional'      // grief, loss, confession, vulnerability
  | 'comedic'        // humor, awkward, absurd, embarrassing
  | 'social'         // party, crowd, meeting, introduction
  | 'conflict'       // argument, confrontation, disagreement
  | 'quiet'          // alone, thinking, waiting, observing
  | 'romantic'       // intimacy, attraction, tension between people
  | 'professional'   // work, negotiation, interview, presentation
  | 'physical'       // movement, sport, manual task, performance
  | 'revelation'     // surprise, discovery, twist, learning something big
  | 'general'        // scene doesn't fit a specific category

export interface SceneAnalysis {
  primary_category: SceneCategory
  secondary_category: SceneCategory | null
  intensity: 'low' | 'medium' | 'high'  // how dramatic/intense is the scene
  involves_others: boolean               // is the character alone or with people
  physical_action: boolean               // does the scene involve movement/action
  emotional_weight: boolean              // does the scene carry emotional significance
  key_event: string                      // what is actually happening (extracted)
  relevant_character_fields: string[]    // which character sheet fields to use
}

export interface Character {
  id: string
  name: string
  vibe_summary: string
  core_trait: string
  secondary_trait?: string | null
  hidden_quality?: string | null
  greatest_fear?: string | null
  full_character_sheet?: string
  behavior_dangerous?: string
  behavior_funny?: string
  behavior_emotional?: string
  behavior_social?: string
  behavior_conflict?: string
  physical_appearance?: string
  movement_style?: string
  signature_gesture?: string | null
  voice_description?: string
  speaking_style?: string
  verbal_habits?: string | null
  voice_sample_url?: string | null
  voice_analyzed_description?: string | null
  genres?: string[]
  allowed_uses?: string[]
  [key: string]: any
}

export interface EnrichmentResult {
  enriched_prompt: string
  facial_expression: string
  body_language: string
  emotional_state: string
  dialogue_direction: string
  scene_integration: string
  scene_analysis: SceneAnalysis
  character_fields_used: string[]
  word_count: {
    original: number
    enriched: number
    multiplier: string
  }
  // Backwards-compatible convenience properties
  success?: boolean
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
    scene_integration: string
    enriched_prompt: string
  }
  model_used?: string
}

// ═══════════════════════════════════════════════════════════
// STEP 1: SCENE ANALYZER
// Figures out what kind of scene this is
// ═══════════════════════════════════════════════════════════

export function analyzeScene(scenePrompt: string): SceneAnalysis {
  const prompt = scenePrompt.toLowerCase()

  // Keyword maps for each scene category
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

  // Score each category
  const scores: Record<SceneCategory, number> = {} as Record<SceneCategory, number>
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (prompt.includes(keyword)) {
        score += keyword.split(' ').length // multi-word phrases score higher
      }
    }
    scores[category as SceneCategory] = score
  }

  // Sort by score to find primary and secondary
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([cat]) => cat !== 'general')

  const primary_category = (sorted[0]?.[0] as SceneCategory) || 'general'
  const secondary_score = sorted[1]?.[1] || 0
  const secondary_category = secondary_score > 0
    ? (sorted[1]?.[0] as SceneCategory)
    : null

  // Assess intensity
  const highIntensityWords = [
    'desperate', 'screaming', 'dying', 'last chance', 'only seconds',
    'no way out', 'destroyed', 'shattered', 'explosion', 'crashes', 'final'
  ]
  const lowIntensityWords = [
    'quietly', 'slowly', 'casually', 'briefly', 'just', 'simple',
    'quick', 'small', 'minor', 'slightly'
  ]
  
  const hasHighIntensity = highIntensityWords.some(w => prompt.includes(w))
  const hasLowIntensity = lowIntensityWords.some(w => prompt.includes(w))
  
  let intensity: 'low' | 'medium' | 'high' = 'medium'
  if (hasHighIntensity) intensity = 'high'
  else if (hasLowIntensity) intensity = 'low'

  // Other scene properties
  const involves_others = !['alone', 'by himself', 'by herself', 'by themselves', 'no one']
    .some(w => prompt.includes(w))
  
  const physical_action = ['run', 'fight', 'jump', 'climb', 'chase', 'move', 'walk', 'physical']
    .some(w => prompt.includes(w))
  
  const emotional_weight = primary_category === 'emotional' || secondary_category === 'emotional' ||
    ['loss', 'death', 'grief', 'heartbreak', 'confession', 'goodbye'].some(w => prompt.includes(w))

  // Extract the key event (what's actually happening)
  // Keep it simple — just clean up the prompt a bit
  const key_event = scenePrompt.trim()

  // Decide which character fields are most relevant
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
    involves_others,
    physical_action,
    emotional_weight,
    key_event,
    relevant_character_fields
  }
}

// ═══════════════════════════════════════════════════════════
// STEP 2: FIELD SELECTOR
// Picks which parts of the character sheet actually matter
// ═══════════════════════════════════════════════════════════

function selectRelevantFields(
  primary: SceneCategory,
  secondary: SceneCategory | null,
  intensity: 'low' | 'medium' | 'high',
  involves_others: boolean,
  physical_action: boolean
): string[] {
  
  // Always included regardless of scene type
  const always = ['core_trait', 'vibe_summary']
  
  // Category-specific fields
  const categoryFields: Record<SceneCategory, string[]> = {
    dangerous: [
      'behavior_dangerous',
      'movement_style',
      ...(intensity === 'high' ? ['hidden_quality', 'greatest_fear'] : []),
      ...(involves_others ? ['behavior_social'] : [])
    ],
    emotional: [
      'behavior_emotional',
      'hidden_quality',
      'greatest_fear',
      ...(involves_others ? ['speaking_style', 'verbal_habits'] : []),
      ...(intensity === 'high' ? ['secondary_trait'] : [])
    ],
    comedic: [
      'behavior_funny',
      'verbal_habits',
      'signature_gesture',
      ...(involves_others ? ['behavior_social'] : []),
      'speaking_style'
    ],
    social: [
      'behavior_social',
      'speaking_style',
      'verbal_habits',
      ...(intensity === 'high' ? ['secondary_trait'] : [])
    ],
    conflict: [
      'behavior_conflict',
      'speaking_style',
      ...(intensity === 'high' ? ['greatest_fear', 'hidden_quality'] : []),
      'secondary_trait'
    ],
    quiet: [
      'hidden_quality',
      'movement_style',
      'secondary_trait',
      ...(intensity === 'low' ? ['signature_gesture'] : [])
    ],
    romantic: [
      'hidden_quality',
      'behavior_emotional',
      'speaking_style',
      ...(involves_others ? ['behavior_social'] : []),
      'secondary_trait'
    ],
    professional: [
      'behavior_social',
      'speaking_style',
      'verbal_habits',
      'secondary_trait',
      ...(intensity === 'high' ? ['behavior_conflict'] : [])
    ],
    physical: [
      'movement_style',
      'signature_gesture',
      'behavior_dangerous',
      ...(intensity === 'high' ? ['voice_description'] : [])
    ],
    revelation: [
      'hidden_quality',
      'behavior_emotional',
      'secondary_trait',
      'greatest_fear',
      ...(involves_others ? ['behavior_social'] : [])
    ],
    general: [
      'secondary_trait',
      'movement_style',
      'speaking_style'
    ]
  }

  // Combine always + primary + secondary (partial)
  const fields = new Set([
    ...always,
    ...(categoryFields[primary] || [])
  ])

  // Add some secondary fields if there is a strong secondary category
  if (secondary && secondary !== 'general') {
    const secondaryFields = categoryFields[secondary] || []
    // Only add the first 2 secondary fields to avoid bloat
    secondaryFields.slice(0, 2).forEach(f => fields.add(f))
  }

  // Add physical presence if physical action involved
  if (physical_action) {
    fields.add('movement_style')
    fields.add('signature_gesture')
  }

  // Add voice if there will likely be dialogue
  if (involves_others) {
    fields.add('voice_description')
    fields.add('speaking_style')
  }

  return Array.from(fields)
}

// ═══════════════════════════════════════════════════════════
// STEP 3: CHARACTER CONTEXT BUILDER
// Builds only the relevant portion of the character sheet
// ═══════════════════════════════════════════════════════════

export function buildCharacterContext(
  character: Character,
  relevantFields: string[],
  scene_analysis: SceneAnalysis
): string {
  
  const lines: string[] = []
  
  lines.push(`CHARACTER: ${character.name}`)
  lines.push(`VIBE: ${character.vibe_summary}`)
  lines.push('')

  // Core trait always goes in
  if (character.core_trait) {
    lines.push(`CORE PERSONALITY: ${character.core_trait}`)
  }

  // Secondary trait if selected
  if (relevantFields.includes('secondary_trait') && character.secondary_trait) {
    lines.push(`SECONDARY TRAIT: ${character.secondary_trait}`)
  }

  lines.push('')

  // Scene-specific behavior (the most important part)
  const behaviorMap: Record<string, string | undefined> = {
    behavior_dangerous: character.behavior_dangerous,
    behavior_funny: character.behavior_funny,
    behavior_emotional: character.behavior_emotional,
    behavior_social: character.behavior_social,
    behavior_conflict: character.behavior_conflict
  }

  const behaviorLabels: Record<string, string> = {
    behavior_dangerous: 'IN DANGEROUS SITUATIONS',
    behavior_funny: 'IN COMEDIC SITUATIONS',
    behavior_emotional: 'IN EMOTIONAL MOMENTS',
    behavior_social: 'IN SOCIAL SITUATIONS',
    behavior_conflict: 'IN CONFLICT'
  }

  let hasBehavior = false
  for (const field of relevantFields) {
    if (field.startsWith('behavior_') && behaviorMap[field]) {
      lines.push(`${behaviorLabels[field]}:`)
      lines.push(behaviorMap[field]!)
      lines.push('')
      hasBehavior = true
    }
  }

  // Hidden quality (only when scene calls for depth)
  if (relevantFields.includes('hidden_quality') && character.hidden_quality) {
    lines.push(`HIDDEN QUALITY (shows in this type of scene):`)
    lines.push(character.hidden_quality)
    lines.push('')
  }

  // Greatest fear (only in high-stakes scenes)
  if (relevantFields.includes('greatest_fear') && character.greatest_fear) {
    lines.push(`GREATEST FEAR (relevant here):`)
    lines.push(character.greatest_fear)
    lines.push('')
  }

  // Physical presence (only when movement matters)
  if (relevantFields.includes('movement_style') && character.movement_style) {
    lines.push(`HOW THEY MOVE:`)
    lines.push(character.movement_style)
    if (relevantFields.includes('signature_gesture') && character.signature_gesture) {
      lines.push(`Signature habit: ${character.signature_gesture}`)
    }
    lines.push('')
  }

  // Voice and speech (only when dialogue is likely)
  const hasVoiceField = relevantFields.some(f => 
    ['voice_description', 'speaking_style', 'verbal_habits'].includes(f)
  )
  if (hasVoiceField) {
    lines.push(`VOICE AND SPEECH:`)
    if (relevantFields.includes('voice_description')) {
      const voiceDesc = character.voice_analyzed_description || character.voice_description
      if (voiceDesc) lines.push(`Voice: ${voiceDesc}`)
    }
    if (relevantFields.includes('speaking_style') && character.speaking_style) {
      lines.push(`Style: ${character.speaking_style}`)
    }
    if (relevantFields.includes('verbal_habits') && character.verbal_habits) {
      lines.push(`Verbal habits: ${character.verbal_habits}`)
    }
    lines.push('')
  }

  // If NONE of the specific behavior fields matched but we have the full sheet,
  // use a relevant excerpt from the full character sheet as fallback
  if (!hasBehavior && character.full_character_sheet) {
    // Take first 600 chars of the full sheet as context
    const excerpt = character.full_character_sheet.slice(0, 600)
    lines.push(`CHARACTER PROFILE EXCERPT:`)
    lines.push(excerpt + (character.full_character_sheet.length > 600 ? '...' : ''))
    lines.push('')
  }

  // Scene context hint — tell the AI what kind of scene this is
  lines.push(`SCENE TYPE: ${scene_analysis.primary_category.toUpperCase()}`)
  if (scene_analysis.secondary_category) {
    lines.push(`SECONDARY TONE: ${scene_analysis.secondary_category}`)
  }
  lines.push(`INTENSITY: ${scene_analysis.intensity}`)
  lines.push(`INVOLVES OTHERS: ${scene_analysis.involves_others ? 'yes' : 'no — character is alone'}`)

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════
// STEP 4: SYSTEM PROMPT BUILDER
// Creates the right instructions for the AI based on scene type
// ═══════════════════════════════════════════════════════════

export function buildSystemPrompt(scene_analysis: SceneAnalysis): string {
  
  const baseInstructions = `You are the Character Intelligence Layer for Vynter North.

Your purpose: read a scene and a character's personality profile, then describe EXACTLY how that specific character would behave in that specific moment.

FUNDAMENTAL RULES:
1. The character profile is absolute. Never contradict it.
2. Be hyper-specific to THIS character. Generic = failure.
3. Apply only what is relevant to THIS scene. Don't reference traits that don't matter here.
4. The enriched_prompt must read like professional film direction. Natural. Visual. Present tense.
5. If the scene creates tension with their personality, SHOW that tension — never ignore either.
6. Output ONLY valid JSON. No explanation. No markdown. Just the JSON object.`

  // Scene-specific guidance
  const sceneGuidance: Record<SceneCategory, string> = {
    dangerous: `
SCENE GUIDANCE — DANGEROUS/ACTION:
Focus on: how stress changes their body, what their face does under pressure, how they move differently when threatened, whether their performance vs real self shows.
Include: specific physical reactions, breath changes, posture under stress, what survival instinct looks like in this specific person.`,
    
    emotional: `
SCENE GUIDANCE — EMOTIONAL:
Focus on: what happens to their control in this moment, how deeply they feel vs how much they show, what breaks through their guard, what their silence communicates.
Include: micro-expressions, what they do with their hands, how their voice changes, what they can't quite say.`,
    
    comedic: `
SCENE GUIDANCE — COMEDIC/AWKWARD:
Focus on: their specific comedic behavior, how they react to embarrassment, what their face does, whether they lean into or away from the awkwardness.
Include: timing, physical comedy specific to their movement style, how their verbal habits show up here.`,
    
    social: `
SCENE GUIDANCE — SOCIAL:
Focus on: how they carry themselves around others, how they read and respond to the room, whether they dominate or observe, how their social persona shows.
Include: entrance behavior, how they position themselves, eye contact patterns, what their voice does in a group.`,
    
    conflict: `
SCENE GUIDANCE — CONFLICT:
Focus on: whether they escalate or de-escalate, what happens to their voice and body under confrontation, how their specific personality handles being challenged.
Include: whether they get louder or quieter, what their face does when angered, how they use or withhold language.`,
    
    quiet: `
SCENE GUIDANCE — QUIET/ALONE:
Focus on: what this person does when no one is watching, how they occupy space alone, what their stillness looks like, what they do with their hands and eyes.
Include: small habitual behaviors that only emerge in private, their relationship with their own thoughts.`,
    
    romantic: `
SCENE GUIDANCE — ROMANTIC:
Focus on: how vulnerability shows in this specific person, what they do with attraction or emotional closeness, where their guard is and where it isn't.
Include: physical proximity behavior, voice changes, what they don't say as much as what they do.`,
    
    professional: `
SCENE GUIDANCE — PROFESSIONAL:
Focus on: how their personality shows through a professional facade, whether they adapt or stay consistent, how status dynamics affect their behavior.
Include: posture, language formality levels, what their nerves or confidence look like in a professional context.`,
    
    physical: `
SCENE GUIDANCE — PHYSICAL ACTION:
Focus on: how their personality affects their physical performance, what their movement style looks like in action, how their body communicates who they are.
Include: specific details about how they move, their relationship with physical challenge, what the action reveals about them.`,
    
    revelation: `
SCENE GUIDANCE — REVELATION/DISCOVERY:
Focus on: how this specific person processes being shocked or learning something significant, the moment before they react and the moment after, what they reveal about themselves in unguarded surprise.
Include: the physical moment of realization, how control breaks or holds, what comes out when the unexpected hits.`,
    
    general: `
SCENE GUIDANCE — GENERAL:
Apply the character's core personality and most distinctive traits to whatever is happening. Show who they fundamentally are through how they exist in this moment.`
  }

  const outputFormat = `
OUTPUT FORMAT — exactly this JSON structure:
{
  "facial_expression": "specific description of their face in this moment — what muscles, what the eyes are doing, what it communicates",
  "body_language": "specific physical behavior and posture — where weight is, what hands are doing, how they hold themselves",
  "emotional_state": "what is happening internally as it shows externally — not just what they feel but how that feeling manifests physically",
  "dialogue_direction": "how they would speak RIGHT NOW — pace, volume, what kind of content. NEVER write their actual words. Describe the delivery.",
  "scene_integration": "one sentence on how their specific personality changes this scene from what it would be with a generic character",
  "enriched_prompt": "the complete scene description rewritten with all behavioral detail woven in naturally — this is what goes to the video generator. Write in present tense, film direction style, 100-250 words depending on scene complexity"
}`

  return baseInstructions + 
    (sceneGuidance[scene_analysis.primary_category] || sceneGuidance.general) + 
    outputFormat
}

// ═══════════════════════════════════════════════════════════
// STEP 5: RESPONSE PARSER
// Safely extracts the AI's JSON response
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
    // Try direct parse first
    return JSON.parse(rawText)
  } catch {
    // Strip markdown fences if present
    const stripped = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    
    try {
      return JSON.parse(stripped)
    } catch {
      // Extract JSON object using regex
      const match = stripped.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return JSON.parse(match[0])
        } catch {
          // JSON is malformed — try to salvage key fields
          const extractField = (field: string): string => {
            const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:"[^"]*")*)`)
            const m = stripped.match(regex)
            return m ? m[1] : ''
          }
          
          const enriched = extractField('enriched_prompt')
          if (enriched) {
            return {
              facial_expression: extractField('facial_expression') || 'Unable to analyze',
              body_language: extractField('body_language') || 'Unable to analyze',
              emotional_state: extractField('emotional_state') || 'Unable to analyze',
              dialogue_direction: extractField('dialogue_direction') || 'Unable to analyze',
              scene_integration: extractField('scene_integration') || 'Character intelligence applied',
              enriched_prompt: enriched
            }
          }
          
          return null
        }
      }
      return null
    }
  }
}

// ═══════════════════════════════════════════════════════════
// FALLBACK SYNTHESIZER
// High-fidelity fallback behavior when offline or API is down
// ═══════════════════════════════════════════════════════════

export function synthesizeFallbackEnrichment(
  character: Character,
  scene: string,
  scene_analysis: SceneAnalysis
): {
  facial_expression: string
  body_language: string
  emotional_state: string
  dialogue_direction: string
  scene_integration: string
  enriched_prompt: string
} {
  const name = character.name || "The character"
  const isCairo = name.toLowerCase().includes("cairo")
  const isSable = name.toLowerCase().includes("sable")
  const isDrew = name.toLowerCase().includes("drew")

  if (isCairo) {
    return {
      facial_expression:
        "Chin lifted with an exaggerated smirk that masks acute vigilance; eyes darting subtly sideways to assess who is watching before snapping back into a rehearsed expression of effortless superiority.",
      body_language:
        "Enters taking up deliberate space with a wide stance and signature sideways lean. Chest pushed forward, refusing to duck or shrink. Shoulders locked into performative composure, every step calculated to look casual.",
      emotional_state:
        "Acute underlying panic concealed beneath theatrical confidence. Terrified of having his competence questioned, he aggressively overcorrects by projecting unflappable certainty.",
      dialogue_direction:
        "Rapid, rhythmic cadence, commentating under his breath to control the room. Medium-deep vocal register that strains tighter at the edges under genuine pressure.",
      scene_integration:
        `Turns a ${scene_analysis.primary_category} situation into a private stage where he performs absolute mastery, even while his pulse races.`,
      enriched_prompt: `${scene.trim()} ${name} crosses the threshold with a deliberate sideways tilt, instantly claiming the room with a wide, calculated stance and head tilted high. His chest is out and his chin is up in a posture of performative ease. A razor-thin smirk masks the slight flicker in his eyes as he takes in the hostile energy. For one silent second his face drops flat as the reality hits, then snaps immediately back into sharp showmanship. He adjusts his jacket cuffs with theatrical precision, taking up space without hesitation, his voice dropping into a smooth, resonant cadence that just barely conceals the tension tightening in his throat.`,
    }
  }

  if (isSable) {
    return {
      facial_expression:
        "Unblinking, neutral gaze that lingers a beat longer than comfortable; jaw relaxed but immovable, devoid of hesitation or theatricality.",
      body_language:
        "Absolute economical stillness. Weight settled imperceptibly on her back foot, posture straight and compact. Not a millimeter of wasted movement.",
      emotional_state:
        "Total situational awareness and calm calculation. While the environment accelerates, she slows down, having already calculated three moves ahead.",
      dialogue_direction:
        "Slow, measured, and flat. Long intentional silence before speaking. Drops the exact names of those she addresses with low, unshakeable resonance.",
      scene_integration:
        "Absorbs the tension without reacting, establishing control through silence and surgical economy of action.",
      enriched_prompt: `${scene.trim()} ${name} occupies exactly the space she needs, standing in absolute, unnerving stillness with her weight balanced securely on her back foot. Her gaze holds steady and unhurried, scanning the environment without shifting her shoulders. A single deliberate blink marks the moment she processes the entire situation and calculates what comes next. As tension spikes around her, she does not flinch or raise her posture; she remains grounded and silent, stepping forward with low, soundless precision.`,
    }
  }

  if (isDrew) {
    return {
      facial_expression:
        "Eyes wide and bright with chaotic problem-solving energy; eyebrows raised high, quick self-deprecating grin breaking through sudden realization.",
      body_language:
        "Perpetual forward lean, hands gesticulating rapidly mid-air as if molding invisible solutions. Constantly shifting weight, running a hand through hair.",
      emotional_state:
        "Genuinely earnest panic blended with unstoppable optimism. Desperately wants everyone to be okay, willing to look foolish if it helps fix the issue.",
      dialogue_direction:
        "Fast, warm, frequently cutting off their own sentence with a sudden new idea. Vocal pitch climbing as excitement and pressure mount.",
      scene_integration:
        "Injects kinetic warmth and chaotic ingenuity, breaking tension by impulsively diving straight into the problem.",
      enriched_prompt: `${scene.trim()} ${name} rushes forward with kinetic warmth, leaning in close before realizing they have stepped directly into everyone's personal space. Their hands move non-stop, gesturing and adjusting anything in reach as their thoughts outrun their speech. Running a hand through their hair, they flash a nervous, disarming smile that somehow reassures everyone around them. Their voice lifts with enthusiastic urgency as they scramble to patch things together, turning the crisis into a collaborative, chaotic mission.`,
    }
  }

  return {
    facial_expression: `Subtle expression reflecting core trait: ${character.core_trait}. Eyes alert, reading the ${scene_analysis.primary_category} environment.`,
    body_language: `${character.movement_style || "Grounded, alert posture"}. Physical mannerisms project their presence.`,
    emotional_state: `Driven by internal conflict: ${character.core_trait}, guarding ${character.hidden_quality || "their deeper vulnerability"}.`,
    dialogue_direction: `${character.speaking_style || "Paced and intentional delivery"}. Vocal quality matches ${character.voice_description || "natural tone"}.`,
    scene_integration: `Infuses the scene with specific behavioral identity: ${character.vibe_summary}.`,
    enriched_prompt: `${scene.trim()} ${name} moves with distinct intention (${character.movement_style || "deliberate presence"}). Guided by their nature as ${character.core_trait}, they project ${character.vibe_summary}, their presence immediately shifting the rhythm of the space as their distinctive mannerisms take command of the scene.`,
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN ENRICHMENT FUNCTION
// This is what gets called from the API route
// ═══════════════════════════════════════════════════════════

export async function enrichScene(
  scenePrompt: string,
  character: Character,
  nvidiaApiKey?: string
): Promise<EnrichmentResult>;

export async function enrichScene(params: {
  character: Character;
  scene: string;
  nvidiaApiKey?: string;
}): Promise<EnrichmentResult>;

export async function enrichScene(
  scenePromptOrParams: string | { character: Character; scene: string; nvidiaApiKey?: string },
  characterOpt?: Character,
  nvidiaApiKeyOpt?: string
): Promise<EnrichmentResult> {
  // Normalize arguments to support both positional and object signatures
  let scenePrompt: string
  let character: Character
  let nvidiaApiKey: string

  if (typeof scenePromptOrParams === 'object') {
    scenePrompt = scenePromptOrParams.scene
    character = scenePromptOrParams.character
    nvidiaApiKey = scenePromptOrParams.nvidiaApiKey || process.env.NVIDIA_API_KEY || ''
  } else {
    scenePrompt = scenePromptOrParams
    character = characterOpt!
    nvidiaApiKey = nvidiaApiKeyOpt || process.env.NVIDIA_API_KEY || ''
  }
  
  // Step 1: Analyze the scene
  const scene_analysis = analyzeScene(scenePrompt)
  
  // Step 2: Select relevant character fields
  const character_fields_used = scene_analysis.relevant_character_fields
  
  // Step 3: Build focused character context
  const characterContext = buildCharacterContext(
    character,
    character_fields_used,
    scene_analysis
  )
  
  // Step 4: Build the right system prompt for this scene type
  const systemPrompt = buildSystemPrompt(scene_analysis)
  
  // Step 5: Build the user message
  const userMessage = `CHARACTER PROFILE:
${characterContext}

SCENE TO ENRICH:
${scenePrompt}

Apply this character's personality to this specific scene. Focus on what is relevant to a ${scene_analysis.primary_category} scene at ${scene_analysis.intensity} intensity.`

  let parsed: {
    facial_expression: string
    body_language: string
    emotional_state: string
    dialogue_direction: string
    scene_integration: string
    enriched_prompt: string
  } | null = null
  let modelUsed = 'meta/llama-3.1-8b-instruct'

  // Step 6: Call NVIDIA NIM (with graceful fallback if offline/no key)
  if (nvidiaApiKey) {
    try {
      const response = await fetch(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nvidiaApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            max_tokens: 1200,
            temperature: 0.72,
            stream: false
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        const rawText = data.choices?.[0]?.message?.content || ''
        parsed = parseEnrichmentResponse(rawText)
      } else {
        const errText = await response.text()
        console.warn(`NVIDIA NIM API responded with ${response.status}: ${errText}`)
      }
    } catch (err: any) {
      console.warn("NVIDIA NIM fetch error, engaging character synthesizer:", err?.message || err)
    }
  }

  // Fallback if AI response was empty or call failed
  if (!parsed) {
    parsed = synthesizeFallbackEnrichment(character, scenePrompt, scene_analysis)
    modelUsed = 'vynter-intelligence-engine-fallback'
  }

  // Step 8: Calculate word counts
  const original_words = scenePrompt.trim().split(/\s+/).filter(Boolean).length || 1
  const enriched_words = parsed.enriched_prompt.trim().split(/\s+/).filter(Boolean).length || 1
  const multiplierNum = (enriched_words / original_words).toFixed(1)

  return {
    enriched_prompt: parsed.enriched_prompt,
    facial_expression: parsed.facial_expression,
    body_language: parsed.body_language,
    emotional_state: parsed.emotional_state,
    dialogue_direction: parsed.dialogue_direction,
    scene_integration: parsed.scene_integration,
    scene_analysis,
    character_fields_used,
    word_count: {
      original: original_words,
      enriched: enriched_words,
      multiplier: `${multiplierNum}x`
    },
    // Backwards-compatible convenience properties
    success: true,
    character: {
      id: character.id,
      name: character.name,
      vibe_summary: character.vibe_summary,
    },
    original_prompt: scenePrompt,
    behavior_breakdown: {
      facial_expression: parsed.facial_expression,
      body_language: parsed.body_language,
      emotional_state: parsed.emotional_state,
      dialogue_direction: parsed.dialogue_direction,
      scene_integration: parsed.scene_integration,
      enriched_prompt: parsed.enriched_prompt,
    },
    model_used: modelUsed,
  }
}
