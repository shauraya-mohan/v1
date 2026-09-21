export const ICON = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  folder:
    "M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5v-10Z",
  brief: "M4 8h16v11H4V8Zm5 0V6h6v2M4 13h16",
  doc: "M7 3h7l4 4v14H7V3Zm7 0v4h4M9.5 12h6m-6 3.5h6",
  code: "m9 9-3 3 3 3m6-6 3 3-3 3",
  mail: "M3.5 6.5h17v11h-17v-11Zm0 .5 8.5 6 8.5-6",
  pen: "M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z",
  note: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  sun: "M12 4.5v-2m0 19v-2M4.5 12h-2m19 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z",
} as const;

export const VERBS = (
  "Accomplishing Actioning Actualizing Architecting Baking Beaming Beboppin' Befuddling Billowing Blanching " +
  "Bloviating Boogieing Boondoggling Booping Bootstrapping Brewing Bunning Burrowing Calculating Canoodling Caramelizing " +
  "Cascading Catapulting Cerebrating Channeling Channelling Choreographing Churning Clauding Coalescing Cogitating " +
  "Combobulating Composing Computing Concocting Considering Contemplating Cooking Crafting Creating Crunching " +
  "Crystallizing Cultivating Deciphering Deliberating Determining Dilly-dallying Discombobulating Doing Doodling " +
  "Drizzling Ebbing Effecting Elucidating Embellishing Enchanting Envisioning Evaporating Fermenting Fiddle-faddling " +
  "Finagling Flambéing Flibbertigibbeting Flowing Flummoxing Fluttering Forging Forming Frolicking Frosting Gallivanting " +
  "Galloping Garnishing Generating Gesticulating Germinating Gitifying Grooving Gusting Harmonizing Hashing Hatching " +
  "Herding Honking Hullaballooing Hyperspacing Ideating Imagining Improvising Incubating Inferring Infusing Ionizing " +
  "Jitterbugging Julienning Kneading Leavening Levitating Lollygagging Manifesting Marinating Meandering Mulling " +
  "Noodling Percolating Perusing Pondering Puttering Reticulating Rummaging Sautéing Schlepping Simmering Smooshing " +
  "Spelunking Spinning Sussing Synthesizing Thinking Tinkering Transmuting Unfurling Vibing Whirring Wibbling Working " +
  "Wrangling Zhuzhing"
).split(/\s+/);

/** Every outbound link on the site. Sourced from the résumé. */
export const LINKS = {
  email: "mailto:s35mohan@uwaterloo.ca",
  emailText: "s35mohan@uwaterloo.ca",
  github: "https://github.com/shauraya-mohan",
  githubText: "github.com/shauraya-mohan",
  linkedin: "https://www.linkedin.com/in/shauraya-mohan/",
  site: "https://www.shauraya.ca",
  resume: "/resume.pdf",
} as const;

/** Drives which icon a link gets. */
export type LinkKind = "live" | "demo" | "code" | "devpost" | "doc" | "mail" | "linkedin";
export type CardLink = { label: string; href: string; kind?: LinkKind };

export type Card = {
  title: string;
  img: string;
  blurb: string;
  links: CardLink[];
  /** Silent, looping demo. Plays on hover and fills the detail view. */
  demo?: string;
  /** Has an audio track, so the detail view offers sound. */
  sound?: boolean;
  /** The longer telling, for the detail view. */
  detail?: string;
  stack?: string[];
  /** A small, deliberate list of other names this project gets called by — not
   *  auto-derived, so it stays a precise identifier rather than a guess. */
  aliases?: string[];
};
export type Row = {
  logo: string;
  name: string;
  role: string;
  meta: string;
  line: string;
  href?: string;
  /** Black-on-transparent mark — needs inverting on a dark background. */
  mono?: boolean;
  /** A small, deliberate list of other names this gets called by. */
  aliases?: string[];
};

export const CARDS: Card[] = [
  {
    title: "mogr",
    img: "/assets/mogr-poster.jpg",
    blurb:
      "Grooming coach. Scan once, get real guidance on hair, skin and style, rendered onto your own face.",
    aliases: ["grooming coach"],
    demo: "/assets/mogr-demo.mp4",
    detail:
      "Four independent GPT-vision pipelines read skin, hair, facial hair and wardrobe, with a three-run self-consistency ensemble on the skin diagnosis and face-preserving previews from gpt-image-2. Outfits go through a three-stage retrieve-then-reason recommender — an LLM parses intent, a deterministic ranker narrows the closet, an LLM stylist picks the final three — which keeps cost bounded by never reasoning over the whole wardrobe. A separate colour-science engine works out undertone, depth and contrast without an LLM at all, and a MediaPipe capture gate rejects unusable photos before they ever reach a paid vision API.",
    stack: ["Next.js", "Supabase", "GPT-Vision", "MediaPipe", "Postgres RLS"],
    links: [
      { label: "Live", href: "https://trymogr.vercel.app/", kind: "live" },
      { label: "Demo", href: "https://youtu.be/-Xymq5G8VXE", kind: "demo" },
      { label: "Code", href: "https://github.com/shauraya-mohan/mogr", kind: "code" },
    ],
  },
  {
    title: "Aftershock",
    img: "/assets/aftershock-poster.jpg",
    blurb:
      "Push a commit, get back a pull request that fixes it. Six agents drive real browsers at your preview and only file what they can reproduce. Built at Hack the North 2026.",
    aliases: ["hack the north"],
    demo: "/assets/aftershock-demo.mp4",
    detail:
      "No test suite, no selectors, nobody writes a spec. A push fires a webhook, Scout turns what the commit claims into assertions before any browser opens, and two independent oracles go after it: a conformance agent drives the preview deployment against each assertion, while a differential pair replays the same recorded actions against main and diffs the accessibility trees — so a regression the diff never mentioned is caught by construction rather than by judgement. Planning happens exactly once and the base side replays it verbatim, otherwise a difference between them could just be model variance. A critic then tries to kill every finding, and what survives gets diagnosed, patched, redeployed and replayed against the journey that originally failed — the PR opens verified only if that replay goes green. On the live run it caught every cart line rendering $NaN on a route the commit never touched, which typecheck, lint and CI had all passed, and shipped the one-line fix in 180 seconds.",
    stack: ["Next.js 15", "Browserbase", "Stagehand", "OpenAI", "TypeScript", "Vercel"],
    links: [{ label: "Code", href: "https://github.com/CalvinDobbs/aftershock", kind: "code" }],
  },
  {
    title: "Kitchen Copilot",
    img: "/assets/kitchen-copilot-poster.jpg",
    blurb: "Talk at your laptop, food shows up. WebRTC voice over a 35-tool MCP client.",
    demo: "/assets/kitchen-copilot-demo.mp4",
    sound: true,
    detail:
      "Restaurant orders, grocery runs and table reservations, all hands-free. Built on WebRTC and the OpenAI Realtime API with server-minted ephemeral tokens and low-latency barge-in, so you can talk over it mid-sentence. Swiggy's food, grocery and dining platform is wired in through a streamable-HTTP MCP client with 35 tools behind OAuth 2.1 and PKCE, and an LLM intent gateway routes each request to the right tool set, splitting multi-intent prompts into ordered sub-tasks.",
    stack: ["Next.js", "TypeScript", "OpenAI Realtime", "WebRTC", "MCP"],
    links: [
      { label: "Demo", href: "https://youtu.be/dmEgOSmxuUk", kind: "demo" },
      { label: "Code", href: "https://github.com/shauraya-mohan/Swiggy-MCP", kind: "code" },
    ],
  },
  {
    title: "Muse Sketch",
    img: "/assets/muse-sketch-poster.jpg",
    blurb: "Type a sentence, get a runway show. Won the Replicate AI Hackathon.",
    demo: "/assets/muse-sketch-demo.mp4",
    detail:
      "An end-to-end fashion design pipeline that starts at a text prompt and ends at a runway video: text, then sketch, then colour, then model shot, then motion. Gemini nano-banana handles the image stages and veo-3 the video, both through the Replicate API. It won the Replicate AI Hackathon.",
    stack: ["React", "TypeScript", "Node.js", "Replicate", "veo-3"],
    links: [{ label: "Live", href: "https://muse-sketch-studio.vercel.app/#/design", kind: "live" }],
  },
];

export const ROWS: Row[] = [
  {
    logo: "/assets/windscribe.png",
    name: "Windscribe",
    role: "AI Engineer",
    meta: "Toronto · Jan to Aug 2026",
    href: "https://windscribe.com/",
    line: "Confirmation-gated agent tools for Garry, the live text and voice support agent: autonomous refunds, account details, settings changes. Human escalations fell from about 14% to 2%. Also TARS, a Slack bot running every support ticket through three GPT-4o layers and posting the digest.",
  },
  {
    logo: "/assets/controld.png",
    name: "Control D",
    role: "QA and Automation Engineer",
    meta: "Toronto · May to Aug 2026",
    href: "https://controld.com/",
    line: "Triaged DNS filtering issues across 50+ enterprise tickets a week, and automated false positive and negative handling so each reported case verifies itself into the right list.",
  },
  {
    logo: "/assets/itc.png",
    mono: true,
    name: "ITC",
    role: "Software Development Intern",
    meta: "New Delhi · May to Aug 2024",
    line: "Inventory management system in Java and SQL with real time audit trails and automated shipment tracking. Manual handling down 40% for a 10-person logistics team.",
  },
  {
    logo: "/assets/mobifly.jpg",
    name: "Mobifly",
    role: "Technical Intern",
    meta: "Gurgaon",
    line: "Cut deployment time 30% across 30+ machines; SQL pipelines landing 99% error-free.",
  },
];

export type Topic = "about" | "projects" | "experience" | "music" | "resume" | "contact";

export type Answer = {
  q: string;
  lines: string[];
  cards?: Card[];
  rows?: Row[];
  note?: string;
  socials?: CardLink[];
  /** Offer the reach-out form under this answer. */
  form?: boolean;
  /** Show the listening panel under this answer. */
  music?: boolean;
  follow: Topic[];
};

export const SOCIALS: CardLink[] = [
  { label: LINKS.emailText, href: LINKS.email, kind: "mail" },
  { label: LINKS.githubText, href: LINKS.github, kind: "code" },
  { label: "LinkedIn", href: LINKS.linkedin, kind: "linkedin" },
  { label: "Résumé", href: LINKS.resume, kind: "doc" },
];

export const EDUCATION: Row[] = [
  {
    logo: "/assets/University_of_Waterloo_seal.svg",
    name: "University of Waterloo",
    role: "Computer Science, Honours, Co-op",
    meta: "Waterloo, ON · Jan 2025 to present",
    aliases: ["waterloo"],
    href: "https://uwaterloo.ca/",
    line: "CGPA 3.9 out of 4.0.",
  },
];

/**
 * The full universe of rows an AI-answered question can pull from. Curated
 * topic answers keep their own fixed set (ROWS for Experience, EDUCATION for
 * About) — this combined pool is only for free-text turns, whose subject
 * isn't confined to whichever single topic the router happened to guess.
 */
export const ALL_ROWS: Row[] = [...ROWS, ...EDUCATION];

export const ANSWERS: Record<Topic, Answer> = {
  about: {
    q: "Who are you?",
    lines: [
      "AI engineer, computer science at Waterloo. On payroll at Windscribe and Control D.",
      "The work is agents allowed to touch production: tools behind a confirmation gate, personas that hold up over voice and text, evaluation passes over real support traffic.",
      "Before Toronto: ITC in New Delhi and Mobifly in Gurgaon.",
    ],
    rows: EDUCATION,
    follow: ["projects", "experience", "contact"],
  },
  projects: {
    q: "What have you built?",
    lines: ["Four that are worth your time."],
    cards: CARDS,
    follow: ["experience", "resume"],
  },
  experience: {
    q: "Where have you worked?",
    lines: ["Four roles, newest first."],
    rows: ROWS,
    follow: ["projects", "contact"],
  },
  music: {
    q: "What are you listening to?",
    lines: ["Whatever's on is on. This is the honest rotation, not a curated one."],
    music: true,
    follow: ["projects", "about"],
  },
  resume: {
    q: "Can I see the résumé?",
    lines: ["One page, opens in a new tab. Contact details are on it."],
    socials: [
      { label: "Open résumé", href: LINKS.resume, kind: "doc" },
      { label: LINKS.emailText, href: LINKS.email, kind: "mail" },
    ],
    follow: ["experience", "contact"],
  },
  contact: {
    q: "How do I reach you?",
    lines: [
      "Email is fastest. Code lives on GitHub.",
      "Open to Winter 2027 internships, based in Toronto.",
    ],
    socials: SOCIALS,
    form: true,
    follow: ["about", "projects"],
  },
};

export const LABEL: Record<Topic, string> = {
  about: "About",
  projects: "Projects",
  experience: "Experience",
  music: "Listening",
  resume: "Résumé",
  contact: "Contact",
};

/**
 * Route free-text to the topic that answers it. Scored rather than first-match:
 * "how did you build Garry at Windscribe" mentions both building and a job, and
 * a first-match chain would send it to the wrong pile of facts.
 */
/**
 * Signals split into strong and weak. Strong ones are proper nouns that can only
 * mean one thing ("windscribe", "mogr") and switch subject on their own. Weak
 * ones are generic words that need corroboration — "how does the voice part
 * work" should not jump to employment just because it contains "work".
 */
type Signal = { strong: RegExp[]; weak: RegExp[] };

const SIGNALS: Record<Topic, Signal> = {
  projects: {
    strong: [
      /\bmogr\b/, /kitchen copilot/, /muse ?sketch/, /after ?shock/, /\bswiggy\b/,
      /hack ?the ?north/, /browserbase/, /stagehand/, /mediapipe/, /nano.?banana/,
      /gpt-?image/, /face mesh/,
    ],
    weak: [
      /\bprojects?\b/, /\bbuilt\b/, /\bbuild\b/, /\bship(ped|ping)?\b/, /\bside project/,
      /\bhackathon\b/, /grooming/, /\boutfit\b/, /recommender/, /\bmcp\b/, /webrtc/,
      /realtime api/, /\bveo\b/, /accessibility/, /\bdemo\b/, /\brepo\b/, /github/,
      /differential/, /regression/, /pull request/, /\bdiff\b/, /preview deploy/,
    ],
  },
  experience: {
    strong: [
      /windscribe/, /control ?d\b/, /\bitc\b/, /mobifly/, /\bgarry\b/, /\btars\b/,
      /switchboard/, /openclaw/, /stripe/,
    ],
    weak: [
      /\bjobs?\b/, /\bintern(ship)?s?\b/, /\broles?\b/, /\bexperience\b/, /\bemployer/,
      /\bwork(ed|ing)?\s+(at|for|with|on)\b/, /\bwhere\b[^.?]*\bwork/, /work experience/,
      /escalation/, /\bdns\b/, /support (agent|ticket)/, /\bco-?op\b/, /\bpersonas?\b/,
    ],
  },
  music: {
    strong: [/\bspotify\b/, /\bplaylists?\b/, /\balbums?\b/, /\bband\b/],
    weak: [
      /\bmusic\b/, /\blisten(ing)?\b/, /\bsongs?\b/, /\btracks?\b/, /\bartists?\b/,
      /\bgenre\b/, /on repeat/, /\bheadphones?\b/,
    ],
  },
  resume: {
    strong: [/\bresum(e|\u00e9)\b/, /\bcv\b/],
    weak: [/\bpdf\b/],
  },
  contact: {
    strong: [/\bcontact\b/, /\bemail\b/, /get in touch/, /\blinkedin\b/, /winter 2027/, /\bw27\b/],
    weak: [/\breach\b/, /\bhir(e|ing)\b/, /\bavailable\b/, /\brecruit/],
  },
  about: {
    strong: [/\bwaterloo\b/, /\bcgpa\b/, /\bgpa\b/],
    weak: [
      /\bwho\b/, /about (you|him|shauraya)/, /yourself/, /\bschool\b/, /\bstud(y|ies|ying)\b/,
      /\bskills?\b/, /\bstack\b/, /\blanguages?\b/, /\beducation\b/,
    ],
  },
};

// Ties break toward the more specific pile.
const PRIORITY: Topic[] = ["projects", "experience", "contact", "resume", "music", "about"];

function score(text: string): { topic: Topic; hits: number; strong: boolean } {
  const t = text.toLowerCase();
  let best: Topic = "about";
  let bestHits = 0;
  let bestStrong = false;

  for (const topic of PRIORITY) {
    const { strong, weak } = SIGNALS[topic];
    const s = strong.reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
    const hits = s + weak.reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
    // A strong match outranks any pile of weak ones.
    const better = bestStrong ? s > 0 && hits > bestHits : s > 0 || hits > bestHits;
    if (hits > 0 && better) {
      best = topic;
      bestHits = hits;
      bestStrong = s > 0;
    }
  }
  return { topic: best, hits: bestHits, strong: bestStrong };
}

export function matchTopic(text: string): Topic {
  return score(text).topic;
}

/**
 * Follow-ups often carry no signal of their own — "tell me more about that one"
 * would fall back to `about` and pull up the wrong facts and cards. Stay on the
 * current subject unless the new question names something specific or makes a
 * clearly different case.
 */
function hitsFor(text: string, topic: Topic): number {
  const t = text.toLowerCase();
  const { strong, weak } = SIGNALS[topic];
  return [...strong, ...weak].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
}

/**
 * Follow-ups often carry no signal of their own — "tell me more about that one"
 * would fall back to `about` and pull up the wrong facts and cards. Stay on the
 * current subject unless the question names something specific, or points
 * somewhere else while saying nothing about where we already are.
 */
export function matchTopicInContext(question: string, previous: Topic | null): Topic {
  const { topic, hits, strong } = score(question);
  if (strong) return topic;
  if (!previous || topic === previous) return topic;

  // Nothing here belongs to the current subject, so a single signal is enough.
  if (hits >= 1 && hitsFor(question, previous) === 0) return topic;

  return hits >= 2 ? topic : previous;
}

export function greetingFor(hour: number): string {
  const part = hour < 5 ? "Late night" : hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  return `${part}, I'm Shauraya`;
}

export const stagger = (i: number) => `${(0.06 * i + 0.02).toFixed(2)}s`;
