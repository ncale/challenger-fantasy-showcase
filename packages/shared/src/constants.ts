import type { PointsConfig, ScoringProfile } from "@challenger-fantasy/schemas";
import type { PointCategories } from "@challenger-fantasy/types";

export const UFC = {
  ORG_ID: "cc8e9451-bdc3-4526-ba62-ace6e190e5bf",
} as const;

export const UFCSTATS = {
  SOURCE_NAME: "ufcstats",
  URLS: {
    UPCOMING_EVENTS: "http://ufcstats.com/statistics/events/upcoming",
    EVENT_BASE: "http://ufcstats.com/event-details/",
    FIGHT_BASE: "http://ufcstats.com/fight-details/",
    FIGHTER_BASE: "http://ufcstats.com/fighter-details/",
  },
} as const;

const PRIMARY_DOMAIN = "challengerfantasy.com";

const LANDING_DOMAIN = PRIMARY_DOMAIN;
const APP_DOMAIN = `app.${PRIMARY_DOMAIN}`;
const STATS_DOMAIN = `stats.${PRIMARY_DOMAIN}`;
const CONTACT_EMAIL = `contact@${PRIMARY_DOMAIN}`;

const LANDING_URL = `https://${LANDING_DOMAIN}`;
const APP_URL = `https://${APP_DOMAIN}`;

export const LINKS = {
  LANDING_URL,
  APP_URL,
  DEMO_URL: `https://${APP_DOMAIN}/demo`,
  STATS_URL: `https://${STATS_DOMAIN}`,
  TOS: `${LANDING_URL}/tos`,
  PRIVACY: `${LANDING_URL}/privacy`,
  ABOUT: `${LANDING_URL}/about`,
  BLOG: `${LANDING_URL}/tos`,
  CONTACT: `${LANDING_URL}/contact`,
  SUPPORT: `${LANDING_URL}/contact`,
  DISCORD_INVITE: "https://discord.gg/uwqBu9FCDA",
  TWITTER: "https://x.com/ChallengerHub",
  INSTAGRAM: "https://www.instagram.com/challengerfantasy/",
  CONTACT_EMAIL: CONTACT_EMAIL,
  CONTACT_EMAIL_LINK: `mailto:${CONTACT_EMAIL}`,
  PWA_INFO: "https://en.wikipedia.org/wiki/Progressive_web_app",
  PWA_INSTRUCTIIONS: null,
  JOIN: `${APP_URL}/join`,
  START: `${APP_URL}/start`,
  IOS_STORE_URL: "https://apps.apple.com/us/app/challenger-fantasy-sports/id6761962188",
  CODE_SHOWCASE: "https://github.com/ncale/challenger-fantasy-showcase",
} as const;

// TODO: migrate to the cms
export const METADATA = {
  TITLE: "Challenger - Play Fantasy MMA",
  DESCRIPTION: "Build dream teams, compete with friends, and climb the leaderboards.",
  TAGS: ["Fantasy MMA", "Fantasy Sports", "MMA", "Sports", "Challenger Fantasy", "UFC"],
} as const;

export const SPECIAL_CHARS = {
  INTERPUNCT: "·",
  BULLET: "•",
  STAR: "✦",
  CHECK: "✓",
} as const;

export const TIME_MS = {
  ONE_MINUTE: 1000 * 60,
  HALF_HOUR: 1000 * 60 * 30,
  ONE_HOUR: 1000 * 60 * 60,
  HALF_DAY: 1000 * 60 * 60 * 12,
  ONE_DAY: 1000 * 60 * 60 * 24,
} as const;

export const SCORE_CATEGORIES_FORMATTED: PointCategories<string> = {
  win: "Win",
  sigStrike: "Sig Strike",
  standingStrike: "Standing Strike",
  groundStrike: "Ground Strike",
  headStrike: "Head Strike",
  bodyStrike: "Body Strike",
  takedown: "Takedown",
  controlTimeSecond: "Control Time Second",
  knockdown: "Knockdown",
  subAttempt: "Sub Attempt",
  finish: "Finish",
  finishRnd1Bonus: `Round 1 Finish Bonus ${SPECIAL_CHARS.STAR}`,
  finishRnd2Bonus: `Round 2 Finish Bonus ${SPECIAL_CHARS.STAR}`,
} as const;

const ADMIN_USER_IDS_BY_NAME = {
  NICK: "0224527c-c682-4636-a520-ce7f366c5134",
  WARREN: "0c466078-1033-4817-9017-95a940f7e8da",
};

export const ADMIN_USER_IDS = Array.from(Object.values(ADMIN_USER_IDS_BY_NAME));

export const CURRENT_CHAMPIONS = [
  { id: "1", full_name: "Tom Aspinall", slug: "tom-aspinall" },
  { id: "3", full_name: "Magomed Ankalaev", slug: "magomed-ankalaev" },
  { id: "7", full_name: "Khamzat Chimaev", slug: "khamzat-chimaev" },
  { id: "8", full_name: "Jack Della Maddalena", slug: "jack-della-maddalena" },
  { id: "2", full_name: "Ilia Topuria", slug: "ilia-topuria" },
  {
    id: "4",
    full_name: "Alexander Volkanovski",
    slug: "alexander-volkanovski",
  },
  { id: "6", full_name: "Merab Dvalishvili", slug: "merab-dvalishvili" },
  { id: "31", full_name: "Alexandre Pantoja", slug: "alexandre-pantoja" },
  { id: "34", full_name: "Kayla Harrison", slug: "kayla-harrison" },
  { id: "32", full_name: "Valentina Shevchenko", slug: "valentina-shevchenko" },
  { id: "33", full_name: "Zhang Weili", slug: "zhang-weili" },
];

export const TOP_CONTENDERS = [
  { id: "41", full_name: "Joshua Van", slug: "joshua-van" },
  { id: "7", full_name: "Ciryl Gane", slug: "ciryl-gane" },
  { id: "8", full_name: "Alex Pereira", slug: "alex-pereira" },
  { id: "9", full_name: "Nassourdine Imavov", slug: "nassourdine-imavov" },
  { id: "11", full_name: "Caio Borralho", slug: "caio-borralho" },
  { id: "10", full_name: "Sean Brady", slug: "sean-brady" },
  { id: "12", full_name: "Movsar Evloev", slug: "movsar-evloev" },
  { id: "13", full_name: "Petr Yan", slug: "petr-yan" },
  { id: "44", full_name: "Diego Lopes", slug: "diego-lopes" },
  { id: "46", full_name: "Natalia Silva", slug: "natalia-silva" },
  { id: "47", full_name: "Virna Jandiroba", slug: "virna-jandiroba" },
];

export const USER_AGENT = `challenger-fantasy-fetch/1.0 (+https://${PRIMARY_DOMAIN}; contact=${CONTACT_EMAIL}`;

export const PG_ERROR_CODES = {
  INVALID_INPUT_SYNTAX: "22P02",
  NOT_FOUND: "PGRST116",
} as const;

export const SCORING_PROFILES = {
  balanced: {
    win: 10,
    finish: 5,
    finishRnd1Bonus: 7,
    finishRnd2Bonus: 3,
    takedown: 0.5,
    knockdown: 2,
    subAttempt: 1,
    sigStrike: 0.1,
  },
} satisfies Record<ScoringProfile, PointsConfig>;
