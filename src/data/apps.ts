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
    slug: 'voicelog',
    name: 'VoiceLog',
    wordmark: 'VOICELOG',
    tagline: 'voice journal, on-device.',
    oneLiner: 'talk it out. whisper transcribes. AI reflects back. nothing leaves your phone.',
    status: 'beta',
    betaDate: 'JUN 26',
    hasOwnPage: true,
    hasPrivacy: true,
    hero: {
      headline: 'voice journal,\non-device.',
      blurb: 'open the app. tap once. talk. whisper transcribes locally. an AI mirror reflects back what you said — gently. your voice never leaves your phone.',
      screenshot: '/screenshots/voicelog/hero.png',
    },
    whyBuilt: "i journal by talking. typing kills the flow. every voice-journal app i found uploaded my audio to a server. that's a no. so i built one that runs whisper on-device and never phones home.",
    features: [
      { headline: 'on-device transcription', description: 'whisper.cpp runs locally. your audio never leaves the device.' },
      { headline: 'AI reflection', description: 'a gemini-nano mirror surfaces themes and asks one good question.' },
      { headline: 'ritual UX', description: 'designed to be a 60-second daily ritual, not another habit to drop.' },
      { headline: 'export anywhere', description: 'plain text out. own your data, always.' },
    ],
    screenshots: [
      '/screenshots/voicelog/01.png',
      '/screenshots/voicelog/02.png',
      '/screenshots/voicelog/03.png',
      '/screenshots/voicelog/04.png',
    ],
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
