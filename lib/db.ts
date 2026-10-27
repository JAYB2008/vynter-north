import { supabaseServer, isSupabaseServerConfigured } from "./supabase-server";
import {
  Character,
  Profile,
  Rental,
  SkillTemplate,
  Review,
  GenerationLog,
} from "./types";
import { randomUUID } from "crypto";

// Default pre-seeded demo profiles
export const DEMO_CREATOR: Profile = {
  id: "c0000000-0000-0000-0000-000000000001",
  display_name: "Elena Vance",
  role: "creator",
  bio: "Lead Character Architect at NeoCinema. Specializing in high-tension drama and nuanced protagonists for procedural sci-fi.",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  account_key: "vn-creator-demo-key-999",
  verified: true,
  total_earnings: 14250.0,
  created_at: new Date("2025-01-01T00:00:00Z").toISOString(),
};

export const DEMO_STUDIO: Profile = {
  id: "s0000000-0000-0000-0000-000000000002",
  display_name: "Apex CineLabs",
  role: "studio",
  bio: "AI-native production studio producing episodic web thrillers and high-impact commercial campaigns.",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  account_key: "vn-test-key-001",
  verified: true,
  total_earnings: 0.0,
  created_at: new Date("2025-01-05T00:00:00Z").toISOString(),
};

// Pre-seeded production characters with complete >=1000 char character sheets
export const SEED_CHARACTERS: Character[] = [
  {
    id: "CVR-2025-00001",
    owner_id: DEMO_CREATOR.id,
    name: "Cairo",
    status: "active",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    reference_images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    ],
    vibe_summary: "Loud. Performative. Secretly terrified.",
    description:
      "A magnetic, razor-sharp rogue who commands every room he enters. His swagger is infectious, but beneath the diamond-hard banter lies a hyper-vigilant survivor carrying generational trauma.",
    full_character_sheet: `Cairo is a master of situational dominance who learned very early in life that whoever controls the rhythm of a conversation controls the outcome. Raised in volatile, unstable transit hubs between industrial megastructures, Cairo discovered that appearing confident and indispensable was the only armor that truly protected him from predation.

At his core, Cairo is exceptionally skilled: he possesses instinctual tactical awareness, lightning-fast reflexes, and an innate knack for reading micro-expressions. However, he refuses to let his competence speak quietly. Instead, he relentlessly oversells everything he does, narrating his actions with witty bravado and theatrical showmanship. He dresses in sharp, tailored coats with subtle scuffs at the cuffs—clothing that looks opulent at ten paces but reveals frantic wear up close.

In quiet moments, Cairo’s facade completely crumbles into exhausted vigilance. He counts exits, tracks hands, and cannot sit with his back to an open doorway. His deepest terror is being rendered irrelevant, powerless, or exposed as ordinary. When genuine tragedy strikes someone he cares about, his entire loud persona vanishes instantly into an eerie, chilling silence. He stops talking, his eyes darken into laser focus, and he executes necessary tasks with surgical efficiency without uttering a single self-aggrandizing joke.`,
    behavior_dangerous:
      "Gets louder and more theatrical when frightened. Refuses to duck or curl up; stands wide, makes sarcastic remarks, and uses bravado as a physiological shield. However, if an ally is harmed, his mask drops instantly into dead-eyed stillness and lethal competence.",
    behavior_funny:
      "Laughs with a loud, theatrical bark that commands everyone else to join in. Loves absurd, irreverent humor, but goes tight-lipped and prickly if he becomes the butt of someone else's joke.",
    behavior_emotional:
      "Vehemently suppresses grief or vulnerability. Deflects questions about his feelings with rapid-fire one-liners, but his voice drops in pitch and micro-tremors appear in his hands.",
    behavior_social:
      "Instantly dominates the focal point of the room. Walks with a wide stance, makes direct eye contact, gestures expressively, and buys rounds or addresses the crowd directly.",
    behavior_conflict:
      "Escalates verbally with aggressive charm. Uses cutting insults packaged as friendly advice. Steps into the opponent's personal space rather than retreating.",
    physical_appearance:
      "Lean, athletic build around 6'1\", sharp angular jawline, close-trimmed fade, penetrating hazel eyes. Wears high-collar dark dusters over distressed tactical shirts and antique silver rings.",
    movement_style:
      "Takes up space deliberately. Wide stance, chest forward, chin lifted. Characteristic sideways lean when leaning against counters or doors. Strolls rather than walks.",
    signature_gesture:
      "Smoothly adjusts both coat cuffs with his thumbs whenever entering a room or finishing a sentence.",
    core_trait: "Overconfident but genuinely skilled — always oversells what he can actually deliver.",
    secondary_trait: "Hyper-vigilant protector of anyone smaller or weaker than himself.",
    hidden_quality:
      "When someone else is in mortal danger, every trace of his performative ego vanishes instantly into cold, selfless competence.",
    greatest_fear: "Being seen as helpless, pitiful, or easily replaced.",
    voice_description:
      "Medium-deep baritone with a smooth, resonant timbre. Velvety and magnetic at baseline, but tightens into a sharp rasp when acute panic sets in.",
    speaking_style:
      "Fast-paced, highly rhythmic, filled with self-referential commentary and dramatic pauses.",
    verbal_habits:
      "Frequently refers to himself in the third person under extreme stress; says 'Watch and learn' right before attempting risky maneuvers.",
    voice_sample_url: null,
    voice_analyzed_description:
      "Low-mid baritone with energetic cadences, 140 WPM delivery, subtle urban Atlantic dialect markers, and micro-cracks around 180Hz under simulated stress.",
    genres: ["Action", "Comedy", "Thriller", "Adventure"],
    allowed_uses: ["film", "advertising", "social_content", "gaming"],
    rental_price_daily: 12.0,
    rental_price_weekly: 55.0,
    rental_price_monthly: 180.0,
    purchase_price: 2400.0,
    is_free: false,
    fame_score: 96,
    total_rentals: 148,
    total_views: 4520,
    created_at: new Date("2025-01-10T00:00:00Z").toISOString(),
    updated_at: new Date("2025-01-10T00:00:00Z").toISOString(),
  },
  {
    id: "CVR-2025-00002",
    owner_id: DEMO_CREATOR.id,
    name: "Sable",
    status: "active",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    reference_images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    ],
    vibe_summary: "Still. Watchful. Already decided.",
    description:
      "An unshakeable operative who operates with surgical precision and eerie economy of motion. When everyone else is reacting, Sable has already concluded the endgame.",
    full_character_sheet: `Sable is defined by profound, disciplined stillness. In a world characterized by chaotic noise and hasty overreaction, she processes information with the patience of deep water. Former high-tier security intelligence contractor turned freelance tactician, she views human interactions as spatial and psychological geometries.

She does not fidget. She does not shift her weight unnecessarily. Her posture is immaculate, and when she looks at someone, she maintains eye contact for precisely two beats longer than conventional social etiquette dictates. This is not hostility; it is pure, unfiltered analysis.

Behind her stoic exterior lies a fierce, uncompromising loyalty to those who earn her trust. She is profoundly allergic to performative loyalty or grand promises. She judges strictly on executed action. In dangerous environments, she is the calmest person in the room—her heart rate paradoxically slows down as stakes escalate. Her greatest inner battle is emotional isolation; having conditioned herself to suppress instinctual vulnerability, she occasionally struggles to connect with spontaneous human warmth.`,
    behavior_dangerous:
      "Goes more still, not less. Heart rate slows, eyes widen imperceptibly, weight shifts soundlessly to back foot. Attacks or escapes with exact, zero-waste physical movements.",
    behavior_funny:
      "Does not laugh out loud; offers a single, razor-thin smirk or a slight tilt of the head. Appreciates dry, pitch-black gallows humor.",
    behavior_emotional:
      "Processes grief in absolute privacy. In public, her jaw sets slightly firmer, but she maintains complete operational focus. A solitary tear or tight throat is the maximum visible sign.",
    behavior_social:
      "Positions herself near perimeters or corners with clear sightlines to every entryway. Never enters the center of a crowded floor unless hunting or escorting an objective.",
    behavior_conflict:
      "Lowers her volume instead of raising it. Speaks with chilling, absolute clarity. Lays out consequences so matter-of-factly that opponents de-escalate out of self-preservation.",
    physical_appearance:
      "5'9\" slender build, toned athletic physique, jet-black hair cut into a clean geometric bob, slate-gray eyes that seem to absorb ambient light. Wears minimalist dark tailored layers and silent combat soles.",
    movement_style:
      "Occupies exactly the space she needs and no more. Weight always balanced on the back foot. Zero extraneous hand gestures or nervous readjustments.",
    signature_gesture:
      "Takes a single deliberate, slow blink while assessing a newly introduced threat.",
    core_trait: "Processes everything silently and completely before speaking or acting.",
    secondary_trait: "Incorruptible personal code of honour and protective instincts.",
    hidden_quality:
      "Experiences profound emotional sensitivity but has developed near-impenetrable psychological dampening mechanisms to function in combat.",
    greatest_fear: "Losing tactical control resulting in the preventable death of someone under her watch.",
    voice_description:
      "Low, even, velvet monotone. Completely flat baseline pitch that refuses to wobble even under deafening gunfire or chaos.",
    speaking_style:
      "Economical and measured. Long intentional pauses before answering. Uses full names when delivering non-negotiable instructions.",
    verbal_habits:
      "Says 'Understood' rather than 'Okay'; asks 'Is that your final decision?' before taking decisive action.",
    voice_sample_url: null,
    voice_analyzed_description:
      "Low female register, steady 105 WPM cadence, neutral mid-European accent with pristine consonant articulation and near-zero pitch variance.",
    genres: ["Thriller", "Drama", "Action", "Sci-Fi"],
    allowed_uses: ["film", "advertising", "social_content", "gaming"],
    rental_price_daily: 15.0,
    rental_price_weekly: 65.0,
    rental_price_monthly: 220.0,
    purchase_price: 3200.0,
    is_free: false,
    fame_score: 98,
    total_rentals: 212,
    total_views: 6180,
    created_at: new Date("2025-01-12T00:00:00Z").toISOString(),
    updated_at: new Date("2025-01-12T00:00:00Z").toISOString(),
  },
  {
    id: "CVR-2025-00003",
    owner_id: DEMO_CREATOR.id,
    name: "Drew",
    status: "active",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    reference_images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    ],
    vibe_summary: "Warm. Impulsive. Breaks things trying to fix them.",
    description:
      "A golden retriever of a human equipped with genius-level engineering intuition and catastrophic impulse control. Drew cares so deeply that they regularly leap before looking.",
    full_character_sheet: `Drew is an incandescent spark of chaotic goodwill. Gifted with an uncanny, intuitive grasp of mechanics, electronics, and human emotion, Drew is constantly trying to make everything and everyone around them work better. Unfortunately, their impatience and runaway empathy mean they rarely stop to read instruction manuals or consider secondary consequences.

Drew is intensely physical in their expression: messy curly hair perpetually disheveled from nervous hands running through it, oversized utility jackets with pockets bulging with screwdrivers, half-eaten snack bars, and spare connectors. When someone speaks, Drew leans in like they are hearing the most fascinating secret in human history.

When a crisis erupts, Drew rushes to volunteer for whatever job sounds hardest, completely unbothered by personal danger. If a machine breaks down, they will tear it apart with their bare hands to keep the lights on for others. Their vulnerability is an utter inability to accept that some things or people simply cannot be fixed. When they fail, it crushes them completely—until the next person asks for help and their battery immediately resets to 100%.`,
    behavior_dangerous:
      "Panics verbally while moving forward physically. Talks at double speed, drops tools, makes jokes with 60% accuracy, yet somehow pulls off miraculous saves under fire.",
    behavior_funny:
      "Laughs loudly and wheezingly, slapping knees or grabbing the nearest person's arm in shared joy. Loves physical comedy and witty banter.",
    behavior_emotional:
      "Cries openly and without shame when witnessing sorrow or heroic sacrifice. Comforts people with immediate physical hugs and hot drinks.",
    behavior_social:
      "Bounces between conversational groups like a pinball. Remembers people's birthdays and favorite songs after meeting them once.",
    behavior_conflict:
      "Hates interpersonal tension; tries desperately to mediate and crack self-deprecating jokes to de-escalate. Becomes stubborn only when someone is being bullied.",
    physical_appearance:
      "5'11\", athletic frame, warm olive skin, infectious smile, expressive amber eyes, perpetually mussed brown curls. Wears layered denim and work jackets with rolled sleeves.",
    movement_style:
      "Perpetual motion. Leans forward into conversations, gestures with open palms, unconsciously reorganizes tabletop items while thinking.",
    signature_gesture:
      "Rakes both hands through their hair and exhales a puff of air upwards when overwhelmed by an idea.",
    core_trait: "Genuinely good-hearted and chaotic — acts before thinking with pure intention.",
    secondary_trait: "Unstoppable mechanical and logistical problem-solving instincts.",
    hidden_quality:
      "Remarkably perceptive: detects when someone is silently struggling long before anyone else notices.",
    greatest_fear: "Being cast out or having their mistakes cause irreversible harm to someone they love.",
    voice_description:
      "Warm, bright, expressive tenor. Delivery speeds up when inspired, inflected with infectious enthusiasm.",
    speaking_style:
      "Fast, conversational, peppered with tangents and interrupted by their own sudden realizations.",
    verbal_habits:
      "Starts sentences with 'Okay hear me out—'; says 'That is actually a phenomenal point' with total sincerity.",
    voice_sample_url: null,
    voice_analyzed_description:
      "Mid-tenor voice, 160 WPM, warm resonant warmth with rising inflection on key words and frequent expressive pitch excursions.",
    genres: ["Comedy", "Adventure", "Drama", "Romance"],
    allowed_uses: ["film", "advertising", "social_content", "gaming"],
    rental_price_daily: 0.0,
    rental_price_weekly: 0.0,
    rental_price_monthly: 0.0,
    purchase_price: null,
    is_free: true,
    fame_score: 92,
    total_rentals: 410,
    total_views: 9420,
    created_at: new Date("2025-01-15T00:00:00Z").toISOString(),
    updated_at: new Date("2025-01-15T00:00:00Z").toISOString(),
  },
  {
    id: "CVR-2025-00004",
    owner_id: DEMO_CREATOR.id,
    name: "Nyx",
    status: "active",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    reference_images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    ],
    vibe_summary: "Sarcastic. Neurotic. Cyber-anarchist.",
    description:
      "A hyper-caffeinated net-runner who trusts code more than humans. Sharp tongue, razor-edged wits, and zero tolerance for corporate platitudes.",
    full_character_sheet: `Nyx operates in the dark spaces between surveillance grids. A former data architect who blew the whistle on sovereign surveillance protocols, she lives off-grid with encrypted terminals and forged identities.

She is intellectually brilliant, blisteringly cynical, and chronically sleep-deprived. She views most social interactions as inefficient handshakes. Her humor is caustic and self-deprecating. However, she secretly feeds orphaned server bandwidth to community hospitals and underfunded enclaves. She will never admit to being an idealist, insisting she only does it 'because clean systems run faster.'

Under real fire, she does not panic—she hyper-focuses on network pathways and telemetry data, her fingers flying across touchpads while she calmly talks her team through hostile perimeters.`,
    behavior_dangerous:
      "Glares at danger as an inconvenience. Types faster, bites her lower lip, and directs firewalls while muttering caustic commentary.",
    behavior_funny:
      "Snorts dryly at dark irony; delivers deadpan tech roasts without cracking a smile.",
    behavior_emotional:
      "Swallows hard, pulls up terminal logs to avoid eye contact, and shows care by discreetly securing the other person's communications and funds.",
    behavior_social:
      "Avoids crowds entirely; stands with headphones half-on, watching people through reflections in dark glass screens.",
    behavior_conflict:
      "Obliterates opponent arguments with undeniable data points and savage rhetorical precision.",
    physical_appearance:
      "5'7\", pale complexion, asymmetric undercut, dark eyeliner, oversized hoodies covered in holographic circuit patches.",
    movement_style:
      "Gliding, silent footsteps; hunched over portable tech decks; sharp sudden head turns when ambient audio shifts.",
    signature_gesture:
      "Taps a rapid four-finger rhythm against her thigh when calculating latency or algorithmic probabilities.",
    core_trait: "Fiercely protective of individual liberty and digital sovereignty.",
    secondary_trait: "Blistering technical genius paired with profound social skepticism.",
    hidden_quality:
      "Secretly deeply sentimental, keeping physical paper photographs of her childhood team tucked into her terminal case.",
    greatest_fear: "Total loss of autonomy or being forced into corporate compliance.",
    voice_description:
      "Raspy, dry alto with clipped diction and rapid analytical cadence.",
    speaking_style:
      "Fast, technical, sardonic, uses hacker argot and concise commands.",
    verbal_habits:
      "Mumbles 'Amateurs' under her breath; repeats 'Let me fix your terrible life' when stepping into crises.",
    voice_sample_url: null,
    voice_analyzed_description: null,
    genres: ["Sci-Fi", "Thriller", "Action"],
    allowed_uses: ["film", "gaming", "social_content"],
    rental_price_daily: 10.0,
    rental_price_weekly: 45.0,
    rental_price_monthly: 150.0,
    purchase_price: 1800.0,
    is_free: false,
    fame_score: 89,
    total_rentals: 87,
    total_views: 2980,
    created_at: new Date("2025-01-20T00:00:00Z").toISOString(),
    updated_at: new Date("2025-01-20T00:00:00Z").toISOString(),
  },
];

// Pre-seeded Skill Templates
export const SEED_SKILL_TEMPLATES: SkillTemplate[] = [
  {
    id: "sk-001",
    creator_id: DEMO_CREATOR.id,
    title: "High-Tension Interrogation Dialogue Framework",
    description:
      "A complete behavioral dialogue module designed for high-stakes psychological confrontations and legal interrogations.",
    category: "dialogue",
    content:
      "Under interrogation, the character never answers the question asked directly. Instead, they answer the unspoken premise, matching eye contact without blinking for 4 full seconds before shifting rhythm.",
    price: 19.0,
    is_free: false,
    purchases: 84,
    created_at: new Date("2025-01-10T00:00:00Z").toISOString(),
    creator: DEMO_CREATOR,
  },
  {
    id: "sk-002",
    creator_id: DEMO_CREATOR.id,
    title: "Zero-Waste Tactical Movement & Stance System",
    description:
      "Surgical, economical movement guidelines for operatives, assassins, and disciplined bodyguard characters.",
    category: "movement",
    content:
      "Movement is strictly rotational and grounded. The character never fidgets, bounces, or rocks on heels. Every transition between cover is executed along the shortest diagonal vector.",
    price: 0.0,
    is_free: true,
    purchases: 320,
    created_at: new Date("2025-01-12T00:00:00Z").toISOString(),
    creator: DEMO_CREATOR,
  },
  {
    id: "sk-003",
    creator_id: DEMO_CREATOR.id,
    title: "Flawed Hero Complex Personality Engine",
    description:
      "Deep psychological blueprint for characters who mask severe vulnerability behind ostentatious competence.",
    category: "personality",
    content:
      "Core contradiction: They can save an entire room of strangers without hesitation, but will shut down completely if offered genuine gratitude or affection.",
    price: 29.0,
    is_free: false,
    purchases: 112,
    created_at: new Date("2025-01-14T00:00:00Z").toISOString(),
    creator: DEMO_CREATOR,
  },
  {
    id: "sk-004",
    creator_id: DEMO_CREATOR.id,
    title: "Neo-Noir Cyberpunk Atmospheric Behavioral Pack",
    description:
      "Complete set of physical, vocal, and sensory habits for dystopian thriller characters.",
    category: "genre",
    content:
      "Sensory integration: Checks rain on their collar, avoids neon glare by tilting brimmed hats, speaks in low raspy tones that blend with ambient industrial hum.",
    price: 0.0,
    is_free: true,
    purchases: 245,
    created_at: new Date("2025-01-18T00:00:00Z").toISOString(),
    creator: DEMO_CREATOR,
  },
];

// Pre-seeded active rentals for Apex CineLabs (Studio)
export const SEED_RENTALS: Rental[] = [
  {
    id: "rent-001",
    character_id: "CVR-2025-00001", // Cairo
    studio_id: DEMO_STUDIO.id,
    rental_type: "monthly",
    status: "active",
    mcp_token: "VN-cairo-studio-token-98765432101234567890",
    generation_credits: 500,
    credits_used: 42,
    price_paid: 180.0,
    starts_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 25).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    character: SEED_CHARACTERS[0],
  },
  {
    id: "rent-002",
    character_id: "CVR-2025-00002", // Sable
    studio_id: DEMO_STUDIO.id,
    rental_type: "weekly",
    status: "active",
    mcp_token: "VN-sable-studio-token-1234567890abcdef9876",
    generation_credits: 200,
    credits_used: 15,
    price_paid: 65.0,
    starts_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    character: SEED_CHARACTERS[1],
  },
  {
    id: "rent-003",
    character_id: "CVR-2025-00003", // Drew (Free)
    studio_id: DEMO_STUDIO.id,
    rental_type: "free",
    status: "active",
    mcp_token: "VN-drew-free-token-4567890abcdef1234567890",
    generation_credits: 100,
    credits_used: 8,
    price_paid: 0.0,
    starts_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    expires_at: null,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    character: SEED_CHARACTERS[2],
  },
];

// Pre-seeded Reviews
export const SEED_REVIEWS: Review[] = [
  {
    id: "rev-001",
    character_id: "CVR-2025-00001",
    reviewer_id: DEMO_STUDIO.id,
    rental_id: "rent-001",
    rating: 5,
    review_text:
      "Cairo's behavioral enrichment is frighteningly accurate. Generated 30 scenes in Runway Gen-3 and his sideways lean and performative panic remained perfectly consistent across every single clip.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewer: DEMO_STUDIO,
  },
  {
    id: "rev-002",
    character_id: "CVR-2025-00002",
    reviewer_id: DEMO_STUDIO.id,
    rental_id: "rent-002",
    rating: 5,
    review_text:
      "Sable's deliberate stillness saved our indie sci-fi short. We didn't have to write any emotional prompts—just typed 'Sable spots the drone' and the MCP gave us brilliant film direction.",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    reviewer: DEMO_STUDIO,
  },
];

// In-Memory store declaration for dev/demo mode
declare global {
  // eslint-disable-next-line no-var
  var __vynterCharacters: Character[] | undefined;
  // eslint-disable-next-line no-var
  var __vynterProfiles: Profile[] | undefined;
  // eslint-disable-next-line no-var
  var __vynterRentals: Rental[] | undefined;
  // eslint-disable-next-line no-var
  var __vynterSkillTemplates: SkillTemplate[] | undefined;
  // eslint-disable-next-line no-var
  var __vynterReviews: Review[] | undefined;
  // eslint-disable-next-line no-var
  var __vynterGenerationLogs: GenerationLog[] | undefined;
}

if (!global.__vynterCharacters) {
  global.__vynterCharacters = [...SEED_CHARACTERS];
}
if (!global.__vynterProfiles) {
  global.__vynterProfiles = [DEMO_CREATOR, DEMO_STUDIO];
}
if (!global.__vynterRentals) {
  global.__vynterRentals = [...SEED_RENTALS];
}
if (!global.__vynterSkillTemplates) {
  global.__vynterSkillTemplates = [...SEED_SKILL_TEMPLATES];
}
if (!global.__vynterReviews) {
  global.__vynterReviews = [...SEED_REVIEWS];
}
if (!global.__vynterGenerationLogs) {
  global.__vynterGenerationLogs = [];
}

/* =========================================================================
   DATABASE ACCESSORS (Dual Mode: Supabase with seamless local fallback)
   ========================================================================= */

export async function getAllCharacters(filter?: {
  genre?: string;
  search?: string;
  type?: string;
  sort?: string;
}): Promise<Character[]> {
  if (isSupabaseServerConfigured()) {
    try {
      let query = supabaseServer
        .from("characters")
        .select("*, owner:profiles(*)")
        .neq("status", "deleted");

      if (filter?.search) {
        query = query.ilike("name", `%${filter.search}%`);
      }
      if (filter?.genre && filter.genre !== "All") {
        query = query.contains("genres", [filter.genre]);
      }
      if (filter?.type === "free") {
        query = query.eq("is_free", true);
      } else if (filter?.type === "rent") {
        query = query.gt("rental_price_daily", 0);
      } else if (filter?.type === "purchase") {
        query = query.not("purchase_price", "is", null);
      }

      if (filter?.sort === "fame") {
        query = query.order("fame_score", { ascending: false });
      } else if (filter?.sort === "price_asc") {
        query = query.order("rental_price_daily", { ascending: true });
      } else if (filter?.sort === "price_desc") {
        query = query.order("rental_price_daily", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Character[];
      }
    } catch (e) {
      console.warn("Supabase characters fetch fallback:", e);
    }
  }

  // Local fallback
  let list = [...(global.__vynterCharacters || [])].filter(
    (c) => c.status !== "deleted"
  );

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.vibe_summary.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
    );
  }

  if (filter?.genre && filter.genre !== "All") {
    list = list.filter((c) =>
      c.genres.some((g) => g.toLowerCase() === filter.genre?.toLowerCase())
    );
  }

  if (filter?.type === "free") {
    list = list.filter((c) => c.is_free);
  } else if (filter?.type === "rent") {
    list = list.filter((c) => !c.is_free && c.rental_price_daily > 0);
  } else if (filter?.type === "purchase") {
    list = list.filter((c) => c.purchase_price !== null && c.purchase_price > 0);
  }

  if (filter?.sort === "fame") {
    list.sort((a, b) => b.fame_score - a.fame_score);
  } else if (filter?.sort === "price_asc") {
    list.sort((a, b) => a.rental_price_daily - b.rental_price_daily);
  } else if (filter?.sort === "price_desc") {
    list.sort((a, b) => b.rental_price_daily - a.rental_price_daily);
  } else {
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return list;
}

export async function getCharacterById(id: string): Promise<Character | null> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("*, owner:profiles(*)")
        .eq("id", id)
        .single();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase getCharacterById fallback:", e);
    }
  }

  const found = global.__vynterCharacters?.find(
    (c) => c.id.toLowerCase() === id.toLowerCase()
  );
  if (found) {
    const owner = global.__vynterProfiles?.find((p) => p.id === found.owner_id);
    return { ...found, owner };
  }
  return null;
}

export async function getCharacterByName(name: string): Promise<Character | null> {
  const norm = name.trim().toLowerCase();
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("*, owner:profiles(*)")
        .ilike("name", norm)
        .neq("status", "deleted")
        .limit(1);
      if (!error && data && data.length > 0) return data[0] as Character;
    } catch (e) {
      console.warn("Supabase getCharacterByName fallback:", e);
    }
  }

  const found = global.__vynterCharacters?.find(
    (c) =>
      c.name.toLowerCase() === norm ||
      c.id.toLowerCase() === norm ||
      c.name.toLowerCase().includes(norm)
  );
  if (found) {
    const owner = global.__vynterProfiles?.find((p) => p.id === found.owner_id);
    return { ...found, owner };
  }
  return null;
}

export async function createCharacter(
  characterData: Partial<Character>
): Promise<Character> {
  const year = new Date().getFullYear();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const id = `CVR-${year}-${randNum}`;

  const fullCharacter: Character = {
    id,
    owner_id: characterData.owner_id || DEMO_CREATOR.id,
    name: characterData.name || "Untitled Character",
    status: "active",
    avatar_url: characterData.avatar_url || null,
    reference_images: characterData.reference_images || [],
    vibe_summary: characterData.vibe_summary || "",
    description: characterData.description || "",
    full_character_sheet: characterData.full_character_sheet || "",
    behavior_dangerous: characterData.behavior_dangerous || "",
    behavior_funny: characterData.behavior_funny || "",
    behavior_emotional: characterData.behavior_emotional || "",
    behavior_social: characterData.behavior_social || "",
    behavior_conflict: characterData.behavior_conflict || "",
    physical_appearance: characterData.physical_appearance || "",
    movement_style: characterData.movement_style || "",
    signature_gesture: characterData.signature_gesture || null,
    core_trait: characterData.core_trait || "",
    secondary_trait: characterData.secondary_trait || null,
    hidden_quality: characterData.hidden_quality || null,
    greatest_fear: characterData.greatest_fear || null,
    voice_description: characterData.voice_description || "",
    speaking_style: characterData.speaking_style || "",
    verbal_habits: characterData.verbal_habits || null,
    voice_sample_url: characterData.voice_sample_url || null,
    voice_analyzed_description: characterData.voice_analyzed_description || null,
    genres: characterData.genres || ["Action"],
    allowed_uses: characterData.allowed_uses || [
      "film",
      "advertising",
      "social_content",
      "gaming",
    ],
    rental_price_daily: Number(characterData.rental_price_daily) || 0,
    rental_price_weekly: Number(characterData.rental_price_weekly) || 0,
    rental_price_monthly: Number(characterData.rental_price_monthly) || 0,
    purchase_price: characterData.purchase_price
      ? Number(characterData.purchase_price)
      : null,
    is_free: Boolean(characterData.is_free),
    fame_score: 50,
    total_rentals: 0,
    total_views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .insert(fullCharacter)
        .select()
        .single();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase createCharacter fallback:", e);
    }
  }

  if (!global.__vynterCharacters) global.__vynterCharacters = [];
  global.__vynterCharacters.unshift(fullCharacter);
  return fullCharacter;
}

export async function updateCharacter(
  id: string,
  updates: Partial<Character>
): Promise<Character | null> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase updateCharacter fallback:", e);
    }
  }

  const index = global.__vynterCharacters?.findIndex((c) => c.id === id);
  if (index !== undefined && index !== -1 && global.__vynterCharacters) {
    global.__vynterCharacters[index] = {
      ...global.__vynterCharacters[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return global.__vynterCharacters[index];
  }
  return null;
}

/* =========================================================================
   PROFILES
   ========================================================================= */

export async function getProfileById(id: string): Promise<Profile | null> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn("Supabase getProfileById fallback:", e);
    }
  }

  return (
    global.__vynterProfiles?.find((p) => p.id === id) ||
    DEMO_STUDIO
  );
}

export async function getProfileByAccountKey(key: string): Promise<Profile | null> {
  const norm = key.trim();
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("account_key", norm)
        .single();
      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn("Supabase getProfileByAccountKey fallback:", e);
    }
  }

  return (
    global.__vynterProfiles?.find((p) => p.account_key === norm) ||
    (norm === "vn-test-key-001" ? DEMO_STUDIO : null)
  );
}

export async function createOrUpdateProfile(
  profileData: Partial<Profile> & { id: string }
): Promise<Profile> {
  const fullProfile: Profile = {
    id: profileData.id,
    display_name: profileData.display_name || "Vynter User",
    role: profileData.role || "studio",
    bio: profileData.bio || null,
    avatar_url: profileData.avatar_url || null,
    account_key:
      profileData.account_key ||
      `vn-${randomUUID().replace(/-/g, "").slice(0, 32)}`,
    verified: Boolean(profileData.verified),
    total_earnings: Number(profileData.total_earnings) || 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("profiles")
        .upsert(fullProfile)
        .select()
        .single();
      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn("Supabase upsert profile fallback:", e);
    }
  }

  const existingIdx = global.__vynterProfiles?.findIndex(
    (p) => p.id === profileData.id
  );
  if (existingIdx !== undefined && existingIdx !== -1 && global.__vynterProfiles) {
    global.__vynterProfiles[existingIdx] = {
      ...global.__vynterProfiles[existingIdx],
      ...fullProfile,
    };
    return global.__vynterProfiles[existingIdx];
  } else {
    global.__vynterProfiles?.push(fullProfile);
    return fullProfile;
  }
}

/* =========================================================================
   RENTALS
   ========================================================================= */

export async function getRentalsByStudioId(studioId: string): Promise<Rental[]> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .select("*, character:characters(*)")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Rental[];
    } catch (e) {
      console.warn("Supabase getRentalsByStudioId fallback:", e);
    }
  }

  return (global.__vynterRentals || []).filter(
    (r) => r.studio_id === studioId && r.status === "active"
  );
}

export async function getRentalByMcpToken(token: string): Promise<Rental | null> {
  const norm = token.trim();
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .select("*, character:characters(*)")
        .eq("mcp_token", norm)
        .single();
      if (!error && data) return data as Rental;
    } catch (e) {
      console.warn("Supabase getRentalByMcpToken fallback:", e);
    }
  }

  return (
    global.__vynterRentals?.find(
      (r) => r.mcp_token === norm && r.status === "active"
    ) || null
  );
}

export async function createRental({
  character_id,
  studio_id,
  rental_type,
  price_paid = 0,
  generation_credits = 100,
}: {
  character_id: string;
  studio_id: string;
  rental_type: "daily" | "weekly" | "monthly" | "purchase" | "free";
  price_paid?: number;
  generation_credits?: number;
}): Promise<Rental> {
  const tokenHex = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 16);
  const mcp_token = `VN-${tokenHex}`;

  let expires_at: string | null = null;
  const now = Date.now();
  if (rental_type === "daily") {
    expires_at = new Date(now + 86400000).toISOString();
  } else if (rental_type === "weekly") {
    expires_at = new Date(now + 86400000 * 7).toISOString();
  } else if (rental_type === "monthly") {
    expires_at = new Date(now + 86400000 * 30).toISOString();
  } else {
    expires_at = null; // Permanent or Free Trial
  }

  const char = await getCharacterById(character_id);

  const newRental: Rental = {
    id: randomUUID(),
    character_id,
    studio_id,
    rental_type,
    status: "active",
    mcp_token,
    generation_credits,
    credits_used: 0,
    price_paid,
    starts_at: new Date().toISOString(),
    expires_at,
    created_at: new Date().toISOString(),
    character: char || undefined,
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .insert(newRental)
        .select("*, character:characters(*)")
        .single();
      if (!error && data) return data as Rental;
    } catch (e) {
      console.warn("Supabase createRental fallback:", e);
    }
  }

  global.__vynterRentals?.unshift(newRental);
  return newRental;
}

export async function incrementRentalCreditsUsed(
  rentalId: string,
  amount = 1
): Promise<void> {
  if (isSupabaseServerConfigured()) {
    try {
      await supabaseServer.rpc("increment_credits", {
        r_id: rentalId,
        amt: amount,
      });
    } catch (e) {
      console.warn("Supabase increment rental credits fallback:", e);
    }
  }

  const r = global.__vynterRentals?.find((item) => item.id === rentalId);
  if (r) {
    r.credits_used += amount;
  }
}

/* =========================================================================
   SKILL TEMPLATES
   ========================================================================= */

export async function getAllSkillTemplates(
  category?: string
): Promise<SkillTemplate[]> {
  if (isSupabaseServerConfigured()) {
    try {
      let query = supabaseServer
        .from("skill_templates")
        .select("*, creator:profiles(*)")
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (!error && data) return data as SkillTemplate[];
    } catch (e) {
      console.warn("Supabase skill_templates fallback:", e);
    }
  }

  let list = [...(global.__vynterSkillTemplates || [])];
  if (category && category !== "All") {
    list = list.filter((t) => t.category === category);
  }
  return list;
}

export async function createSkillTemplate(
  template: Partial<SkillTemplate>
): Promise<SkillTemplate> {
  const newTemplate: SkillTemplate = {
    id: randomUUID(),
    creator_id: template.creator_id || DEMO_CREATOR.id,
    title: template.title || "Untitled Skill Template",
    description: template.description || "",
    category: template.category || "personality",
    content: template.content || "",
    price: Number(template.price) || 0,
    is_free: Boolean(template.is_free),
    purchases: 0,
    created_at: new Date().toISOString(),
    creator: DEMO_CREATOR,
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("skill_templates")
        .insert(newTemplate)
        .select("*, creator:profiles(*)")
        .single();
      if (!error && data) return data as SkillTemplate;
    } catch (e) {
      console.warn("Supabase createSkillTemplate fallback:", e);
    }
  }

  global.__vynterSkillTemplates?.unshift(newTemplate);
  return newTemplate;
}

/* =========================================================================
   REVIEWS & LOGS
   ========================================================================= */

export async function getReviewsByCharacterId(
  characterId: string
): Promise<Review[]> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("reviews")
        .select("*, reviewer:profiles(*)")
        .eq("character_id", characterId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Review[];
    } catch (e) {
      console.warn("Supabase getReviews fallback:", e);
    }
  }

  return (global.__vynterReviews || []).filter(
    (r) => r.character_id.toLowerCase() === characterId.toLowerCase()
  );
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  const newRev: Review = {
    id: randomUUID(),
    character_id: review.character_id!,
    reviewer_id: review.reviewer_id || DEMO_STUDIO.id,
    rental_id: review.rental_id || null,
    rating: review.rating || 5,
    review_text: review.review_text || "",
    created_at: new Date().toISOString(),
    reviewer: DEMO_STUDIO,
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("reviews")
        .insert(newRev)
        .select("*, reviewer:profiles(*)")
        .single();
      if (!error && data) return data as Review;
    } catch (e) {
      console.warn("Supabase createReview fallback:", e);
    }
  }

  global.__vynterReviews?.unshift(newRev);
  return newRev;
}

export async function logGeneration(log: Partial<GenerationLog>): Promise<void> {
  const newLog: GenerationLog = {
    id: randomUUID(),
    rental_id: log.rental_id || null,
    character_id: log.character_id!,
    original_prompt: log.original_prompt || "",
    enriched_prompt: log.enriched_prompt || "",
    original_word_count: log.original_word_count || 0,
    enriched_word_count: log.enriched_word_count || 0,
    status: log.status || "kept",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured()) {
    try {
      await supabaseServer.from("generation_logs").insert(newLog);
    } catch (e) {
      console.warn("Supabase logGeneration fallback:", e);
    }
  }

  if (!global.__vynterGenerationLogs) global.__vynterGenerationLogs = [];
  global.__vynterGenerationLogs.unshift(newLog);
}

export async function checkCharacterNameAvailable(name: string): Promise<boolean> {
  const norm = name.trim().toLowerCase();
  const existing = await getCharacterByName(norm);
  if (existing) return false;
  const chars = await getAllCharacters();
  return !chars.some((c) => c.name.toLowerCase() === norm);
}

export async function createCharacterWithSkills({
  character,
  skills,
}: {
  character: Partial<Character>;
  skills?: any;
}): Promise<Character> {
  const mergedCharacterData: Partial<Character> = {
    ...character,
    vibe_summary: skills?.vibe_summary || character.vibe_summary || "Dynamic AI Persona",
    description: character.description || skills?.core_trait || "",
    full_character_sheet:
      character.full_character_sheet ||
      `Character: ${character.name}\nCore Trait: ${skills?.core_trait || ""}\nMovement: ${skills?.movement_style || ""}\nDanger: ${skills?.handles_danger || ""}\nHumor: ${skills?.humor_style || ""}`,
    behavior_dangerous: skills?.handles_danger || character.behavior_dangerous || "Remains calm and analytical.",
    behavior_funny: skills?.what_makes_laugh || character.behavior_funny || "Appreciates clever wit.",
    behavior_emotional: character.behavior_emotional || "Expressive and empathetic.",
    behavior_social: character.behavior_social || "Approachable and charismatic.",
    behavior_conflict: skills?.what_makes_angry || character.behavior_conflict || "Direct and measured.",
    physical_appearance: character.physical_appearance || "Distinctive screen presence.",
    movement_style: skills?.movement_style || character.movement_style || "Fluid and grounded.",
    signature_gesture: skills?.signature_gesture || character.signature_gesture || null,
    core_trait: skills?.core_trait || character.core_trait || "Resilient and perceptive.",
    secondary_trait: skills?.secondary_trait || character.secondary_trait || null,
    hidden_quality: skills?.hidden_quality || character.hidden_quality || null,
    speaking_style: skills?.speaking_pace || character.speaking_style || "Clear and paced.",
    verbal_habits: skills?.catchphrase || character.verbal_habits || null,
  };

  const created = await createCharacter(mergedCharacterData);
  created.skills = skills || {
    resting_expression: skills?.resting_expression || null,
    movement_style: created.movement_style,
    signature_gesture: created.signature_gesture,
    stress_reaction: skills?.stress_reaction || null,
    core_trait: created.core_trait,
    secondary_trait: created.secondary_trait,
    handles_danger: created.behavior_dangerous,
    what_makes_laugh: created.behavior_funny,
    what_makes_angry: created.behavior_conflict,
    hidden_quality: created.hidden_quality,
    speaking_pace: created.speaking_style,
    language_mixing: skills?.language_mixing || null,
    humor_style: skills?.humor_style || null,
    catchphrase: created.verbal_habits,
    vibe_summary: created.vibe_summary,
  };

  return created;
}

export async function createGenerationLog(
  log: Partial<GenerationLog>
): Promise<GenerationLog> {
  const origWords = log.original_prompt ? log.original_prompt.trim().split(/\s+/).length : 0;
  const enrichWords = log.enriched_prompt ? log.enriched_prompt.trim().split(/\s+/).length : 0;

  const newLog: GenerationLog = {
    id: log.id || randomUUID(),
    rental_id: log.rental_id || null,
    character_id: log.character_id!,
    original_prompt: log.original_prompt || "",
    enriched_prompt: log.enriched_prompt || "",
    original_word_count: log.original_word_count || origWords,
    enriched_word_count: log.enriched_word_count || enrichWords,
    status: log.status || "kept",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("generation_logs")
        .insert(newLog)
        .select()
        .single();
      if (!error && data) return data as GenerationLog;
    } catch (e) {
      console.warn("Supabase createGenerationLog fallback:", e);
    }
  }

  if (!global.__vynterGenerationLogs) global.__vynterGenerationLogs = [];
  global.__vynterGenerationLogs.unshift(newLog);
  return newLog;
}

export async function getAllGenerationLogs(limit: number = 100): Promise<GenerationLog[]> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("generation_logs")
        .select("*, character:characters(*)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data as GenerationLog[];
    } catch (e) {
      console.warn("Supabase getAllGenerationLogs fallback:", e);
    }
  }

  const logs = (global.__vynterGenerationLogs || []).slice(0, limit);
  const chars = global.__vynterCharacters || SEED_CHARACTERS;
  return logs.map((l) => ({
    ...l,
    character: l.character || chars.find((c) => c.id === l.character_id) || null,
  }));
}

export async function updateGenerationLogVideo(
  logId: string,
  videoUrl: string,
  status: string = "succeeded"
): Promise<void> {
  if (isSupabaseServerConfigured()) {
    try {
      await supabaseServer
        .from("generation_logs")
        .update({ video_url: videoUrl, status, updated_at: new Date().toISOString() })
        .eq("id", logId);
    } catch (e) {
      console.warn("Supabase updateGenerationLogVideo fallback:", e);
    }
  }

  const log = global.__vynterGenerationLogs?.find((l) => l.id === logId);
  if (log) {
    log.video_url = videoUrl;
    log.status = status as any;
  }
}

