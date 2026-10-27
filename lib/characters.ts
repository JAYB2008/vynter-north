export interface CharacterProfile {
  id: string;
  name: string;
  vibe_summary: string;
  core_trait: string;
  movement: string;
  stress_reaction: string;
  hidden_quality: string;
  speaking_pace: string;
  verbal_habit: string;
  allowed_genres: string[];
  demo_scene: string;
  avatar_initials?: string;
  avatar_gradient?: string;
  registered_date?: string;
}

export const CHARACTERS: CharacterProfile[] = [
  {
    id: "CVR-2025-00001",
    name: "Cairo",
    vibe_summary: "Loud. Performative. Secretly terrified.",
    core_trait:
      "Overconfident but genuinely skilled — he actually IS good, he just oversells it constantly",
    movement:
      "Takes up space deliberately. Wide stance, chest forward, chin up. Always the last to duck when danger comes because he genuinely believes things will not hit him. Walks with a slight sideways lean that makes him look like he is performing even when he is not.",
    stress_reaction:
      "Gets louder and more theatrical when scared. The more terrified he is, the more he performs confidence. His face goes completely blank for exactly one second when something genuinely surprises him — the mask drops — then snaps back.",
    hidden_quality:
      "When someone ELSE is in real danger he drops every performance completely. Becomes quiet, focused, and competent. This version of him is unrecognizable compared to normal Cairo.",
    speaking_pace:
      "Fast when performing, slow and deliberate when being serious. Medium-deep voice that cracks under real stress.",
    verbal_habit:
      "Commentates on his own actions under pressure. Occasionally refers to himself in third person when things get bad.",
    allowed_genres: ["Action", "Comedy", "Adventure", "Thriller"],
    demo_scene:
      "Cairo and a friend are escaping a collapsing building. A ceiling section falls and blocks the exit. Cairo finds a window. He gets his friend through first. The ledge breaks as he climbs out.",
    avatar_initials: "CR",
    avatar_gradient: "from-purple-600 via-indigo-600 to-violet-800",
    registered_date: "January 14, 2025",
  },
  {
    id: "CVR-2025-00002",
    name: "Sable",
    vibe_summary: "Still. Watchful. Already decided.",
    core_trait:
      "Processes everything silently and completely before speaking or acting. By the time others are still figuring out what happened, Sable has already decided what comes next.",
    movement:
      "Occupies exactly the space she needs and no more. Weight always on the back foot — ready to move but never signaling it. Makes eye contact slightly longer than comfortable. Stillness is her loudest quality.",
    stress_reaction:
      "Goes more still under pressure, not less. While others speed up, Sable slows down. One deliberate blink is often the only visible sign she is processing something significant.",
    hidden_quality:
      "Feels things very deeply but has trained herself not to show it. In rare moments when something breaks through — genuine grief, real joy — the shift is total and brief before control returns.",
    speaking_pace:
      "Slow and deliberate. Never wastes words. Long pauses before speaking that feel intentional, never uncertain. Voice stays flat even under pressure.",
    verbal_habit:
      "Says exactly what she means, nothing more. Uses people's names when making a point she wants them to remember.",
    allowed_genres: ["Thriller", "Drama", "Action", "Sci-Fi"],
    demo_scene:
      "Sable and Cairo are in an underground parking structure. Something moves in the shadows. Cairo is scanning and performing readiness. Sable has already located the threat and taken her first step toward it.",
    avatar_initials: "SB",
    avatar_gradient: "from-cyan-600 via-blue-700 to-slate-900",
    registered_date: "January 19, 2025",
  },
  {
    id: "CVR-2025-00003",
    name: "Drew",
    vibe_summary: "Warm. Impulsive. Breaks things trying to fix them.",
    core_trait:
      "Genuinely good-hearted and chaotic. Acts before thinking but always with the right intention. Creates new problems while solving the original one and somehow still comes out as the hero.",
    movement:
      "Always in motion. Gestures constantly while talking. Leans forward toward whoever is speaking. Physical — hugs people who do not expect it, moves things around unconsciously while thinking.",
    stress_reaction:
      "Starts talking faster and making jokes that land about 60% of the time. Gets more physically expressive. Runs hands through hair repeatedly. Will volunteer for the most dangerous option without thinking about it.",
    hidden_quality:
      "Notices when others are struggling before they say anything and quietly adjusts — less noise, closer attention, an arm on the shoulder at the right moment. This care is always genuine and never performed.",
    speaking_pace:
      "Fast, warm, frequently interrupted by their own new thoughts mid-sentence. Voice rises when excited, which is most of the time.",
    verbal_habit:
      "Starts sentences with 'Okay but—' when pivoting to a new idea. Says 'that is a great point' sincerely, often when the point was actually not great.",
    allowed_genres: ["Comedy", "Adventure", "Drama", "Romance"],
    demo_scene:
      "Drew is trying to fix something that broke at the worst possible time while two other people are depending on them to get it done immediately.",
    avatar_initials: "DW",
    avatar_gradient: "from-amber-500 via-orange-600 to-rose-700",
    registered_date: "February 02, 2025",
  },
];

export function getAllCharacters(): CharacterProfile[] {
  return CHARACTERS;
}

export function findCharacter(idOrName: string): CharacterProfile | undefined {
  if (!idOrName) return undefined;
  const query = idOrName.trim().toLowerCase();
  return CHARACTERS.find(
    (c) =>
      c.id.toLowerCase() === query ||
      c.name.toLowerCase() === query ||
      query.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(query)
  );
}

export function buildCharacterProfilePrompt(character: CharacterProfile): string {
  return `CHARACTER PROFILE:
Name: ${character.name}
Core Trait: ${character.core_trait}
Movement Style: ${character.movement}
Stress Reaction: ${character.stress_reaction}
Hidden Quality: ${character.hidden_quality}
Speaking Pace: ${character.speaking_pace}
Verbal Habits: ${character.verbal_habit}`;
}
