export type AppStatus = 'live' | 'beta' | 'cooking';

export interface Feature {
  headline: string;
  description: string;
}

export interface PricingTier {
  label: string;        // "FREE" | "PREMIUM"
  price: string;        // "₹0" | "₹199/yr"
  subPrice?: string;    // "~₹17/mo · cancel anytime"
  description: string;
}

export interface Pricing {
  free: PricingTier;
  premium?: PricingTier;
}

export interface Review {
  quote: string;
  source: string;       // "PLAY STORE · 5★", "REDDIT · r/QuitSmoking"
}

export interface AppHero {
  headline: string;     // may contain "\n" for line break
  blurb: string;
  screenshot: string;   // public-relative path, e.g. "/screenshots/sutts/hero.png"
}

export interface App {
  slug: string;
  name: string;
  wordmark: string;
  tagline: string;
  oneLiner: string;
  status: AppStatus;
  betaDate?: string;
  playStoreUrl?: string;
  hasOwnPage: boolean;
  hasPrivacy: boolean;
  hero?: AppHero;
  whyBuilt?: string;
  features?: Feature[];
  screenshots?: string[];
  pricing?: Pricing;
  reviews?: Review[];
}

export const apps: App[] = [
  {
    slug: 'sutts',
    name: 'Sutts',
    wordmark: 'SUTTS',
    tagline: 'AI smoking tracker.',
    oneLiner: 'track, reduce, or quit — meets you where you are. on-device tracking, optional AI coach.',
    status: 'live',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.broooapps.cigarettetracker',
    hasOwnPage: true,
    hasPrivacy: true,
    hero: {
      headline: 'AI smoking\ntracker.',
      blurb: 'track every cigarette in a tap. an AI coach watches your patterns and helps you reduce — or quit — at your own pace. fully on-device unless you opt into AI features.',
      screenshot: '/screenshots/sutts/hero.png',
    },
    whyBuilt: "i smoke. tried six trackers — they all want you to quit on day one. that doesn't work for me. so i built one that just counts honestly, learns my pattern, and nudges gently.",
    features: [
      { headline: 'one-tap logging', description: 'add a cigarette from the notification, widget, or app. zero friction.' },
      { headline: 'pattern detection', description: 'spots your trigger times and contexts. shows where the leaks are.' },
      { headline: 'AI coach (premium)', description: 'gemini-powered nudges that respect your goal — reduce, maintain, or quit.' },
      { headline: 'privacy-first', description: 'all data lives on your device. AI features are opt-in.' },
    ],
    screenshots: [
      '/screenshots/sutts/01.png',
      '/screenshots/sutts/02.png',
      '/screenshots/sutts/03.png',
      '/screenshots/sutts/04.png',
    ],
    pricing: {
      free: {
        label: 'FREE',
        price: '₹0',
        description: 'all tracking. pattern detection. weekly summaries. no ads in core flow.',
      },
      premium: {
        label: 'PREMIUM',
        price: '₹199/yr',
        subPrice: '~₹17/mo · cancel anytime',
        description: 'everything in free + AI coach. weekly Gemini-powered nudges. craving check-ins.',
      },
    },
    reviews: [
      { quote: "first tracker that doesn't lecture me. i actually use it.", source: 'PLAY STORE · 5★' },
      { quote: "clean. simple. doesn't try to be my therapist.", source: 'REDDIT · r/QuitSmoking' },
    ],
  },
  {
    slug: 'dearly',
    name: 'Dearly',
    wordmark: 'DEARLY',
    tagline: 'dear diary, spoken.',
    oneLiner: 'the voice journal that writes itself. speak for a minute — and see the patterns beneath.',
    status: 'beta',
    betaDate: 'JUN 26',
    hasOwnPage: true,
    hasPrivacy: true,
    hero: {
      headline: 'dear diary,\nspoken.',
      blurb: "tap the ink drop and talk for a minute. dearly transcribes your words into a clean, serif-set page you'll actually want to reread — then quietly shows you the weather beneath your month.",
      screenshot: '/screenshots/dearly/hero.png',
    },
    whyBuilt: "i journal by talking — typing kills the flow. but every voice-journal app i tried uploaded my raw audio to a server. that's a no. so i built dearly: your voice recordings stay on your device, only the transcription travels (encrypted), and the whole thing reads like paper instead of a spreadsheet.",
    features: [
      { headline: 'speak, and it writes itself', description: 'tap the ink drop, talk a minute, and watch it become a beautifully inked journal page. ten free transcriptions a day, forever.' },
      { headline: "see what's beneath", description: 'premium insights — a mood horizon of your month, the people and places that keep appearing, and patterns like "when work comes up, worry follows."' },
      { headline: 'private by design', description: 'voice recordings never leave your device. transcription travels over an encrypted connection. lock the app behind your fingerprint. delete everything anytime.' },
      { headline: 'feels like paper', description: "serif type, warm linen surfaces, entries that read like pages, moods that drift like weather. a journal shouldn't feel like a form." },
    ],
    screenshots: [
      '/screenshots/dearly/panel-1.png',
      '/screenshots/dearly/panel-2.png',
      '/screenshots/dearly/panel-3.png',
      '/screenshots/dearly/panel-4.png',
      '/screenshots/dearly/panel-5.png',
      '/screenshots/dearly/panel-6.png',
      '/screenshots/dearly/panel-7.png',
      '/screenshots/dearly/panel-8.png',
    ],
    pricing: {
      free: {
        label: 'FREE',
        price: '$0',
        subPrice: 'forever',
        description: 'unlimited recording, 10 transcriptions a day, your full journal, and biometric lock.',
      },
      premium: {
        label: 'DEARLY PRO',
        price: '$24.99/yr',
        subPrice: '~$2.08/mo · or $2.99/mo · 7-day free trial',
        description: 'AI insights — mood horizon, your cast, patterns, reflections — plus export.',
      },
    },
    reviews: [],
  },
  {
    slug: 'randomizer',
    name: 'Randomizer',
    wordmark: 'RANDOMIZER',
    tagline: 'decide. instantly.',
    oneLiner: 'spinners, coin flips, dice, picker — one app for every "I don\'t know, you pick" moment.',
    status: 'live',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.broooapps.randomizer',
    hasOwnPage: false,
    hasPrivacy: true,
  },
  {
    slug: 'budgetit',
    name: 'BudgetIt',
    wordmark: 'BUDGETIT',
    tagline: 'something new is being built.',
    oneLiner: 'follow on X for first looks.',
    status: 'cooking',
    hasOwnPage: false,
    hasPrivacy: false,
  },
];

export function getApp(slug: string): App | undefined {
  return apps.find((a) => a.slug === slug);
}
