const WEIGHT_CLASS_KEY_LABEL_MAP: Record<string, string> = {
  "115lbs_women_strawweight": "Women's Strawweight",
  "125lbs_women_flyweight": "Women's Flyweight",
  "135lbs_women_bantamweight": "Women's Bantamweight",
  "145lbs_women_featherweight": "Women's Featherweight",
  "125lbs_flyweight": "Flyweight",
  "135lbs_bantamweight": "Bantamweight",
  "145lbs_featherweight": "Featherweight",
  "155lbs_lightweight": "Lightweight",
  "170lbs_welterweight": "Welterweight",
  "185lbs_middleweight": "Middleweight",
  "205lbs_light_heavyweight": "Light Heavyweight",
  "265lbs_heavyweight": "Heavyweight",
  "catchweight": "Catchweight",
};

const WEIGHT_CLASS_MAP: Record<string, string> = {
  "flyweight": "125lbs_flyweight",
  "bantamweight": "135lbs_bantamweight",
  "featherweight": "145lbs_featherweight",
  "lightweight": "155lbs_lightweight",
  "welterweight": "170lbs_welterweight",
  "middleweight": "185lbs_middleweight",
  "light heavyweight": "205lbs_light_heavyweight",
  "heavyweight": "265lbs_heavyweight",
  "women's strawweight": "115lbs_women_strawweight",
  "women's flyweight": "125lbs_women_flyweight",
  "women's bantamweight": "135lbs_women_bantamweight",
  "women's featherweight": "145lbs_women_featherweight",
  "catch weight": "catchweight",
};

const WEIGHT_CLASS_KEY_CODE_MAP: Record<string, string> = {
  "115lbs_women_strawweight": "wsw",
  "125lbs_women_flyweight": "wflw",
  "135lbs_women_bantamweight": "wbw",
  "145lbs_women_featherweight": "wfw",
  "125lbs_flyweight": "flw",
  "135lbs_bantamweight": "bw",
  "145lbs_featherweight": "fw",
  "155lbs_lightweight": "lw",
  "170lbs_welterweight": "ww",
  "185lbs_middleweight": "mw",
  "205lbs_light_heavyweight": "lhw",
  "265lbs_heavyweight": "hw",
  "catchweight": "cw",
  "n/a": "n/a",
};

const WEIGHT_CLASS_KEY_LBS_MAP: Record<string, number> = {
  "115lbs_women_strawweight": 115,
  "125lbs_women_flyweight": 125,
  "135lbs_women_bantamweight": 135,
  "145lbs_women_featherweight": 145,
  "125lbs_flyweight": 125,
  "135lbs_bantamweight": 135,
  "145lbs_featherweight": 145,
  "155lbs_lightweight": 155,
  "170lbs_welterweight": 170,
  "185lbs_middleweight": 185,
  "205lbs_light_heavyweight": 205,
  "265lbs_heavyweight": 265,
  "catchweight": 0,
};

export function getWeightClassLabelFromKey(key: string): string {
  const label = WEIGHT_CLASS_KEY_LABEL_MAP[key];
  if (!label) throw new Error(`Unknown weight class key: ${key}`);
  return label;
}

function tryGetWeightCodeFromKey(key: string): string | null {
  try {
    return getWeightCodeFromKey(key);
  } catch {
    return null;
  }
}

export function formatWeightRange(
  lowestKey: string | null | undefined,
  highestKey: string | null | undefined,
): string {
  const low = lowestKey ? tryGetWeightCodeFromKey(lowestKey) : null;
  const high = highestKey ? tryGetWeightCodeFromKey(highestKey) : null;
  if (!low && !high) return "—";
  if (!high || low === high) return low ?? "—";
  if (!low) return high;
  return `${low} – ${high}`;
}

export function toWeightClassKey(rawWeightClass: string): string {
  const normalized = rawWeightClass.trim().toLowerCase();
  const key = WEIGHT_CLASS_MAP[normalized];
  if (!key) throw new Error(`Unknown weight class: ${rawWeightClass}`);
  return key;
}

export function getWeightCodeFromKey(key: string): string {
  const code = WEIGHT_CLASS_KEY_CODE_MAP[key];
  if (!code) throw new Error(`Unknown weight class key: ${key}`);
  return code.toUpperCase();
}

export function getWeightLbsFromKey(key: string): number {
  const lbs = WEIGHT_CLASS_KEY_LBS_MAP[key];
  if (lbs === undefined) throw new Error(`Unknown weight class key: ${key}`);
  return lbs;
}
