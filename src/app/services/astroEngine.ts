/**
 * Lightweight natal chart engine using astronomy-engine (pure JS, no native
 * deps, MIT). Computes Sun / Moon / Ascendant / dominant planet from birth
 * date+time+location. Accuracy is well within sign boundaries — fine for the
 * UI; if you ever need professional-grade ephemerides, swap in Swiss Ephemeris
 * server-side and have this file fetch from a backend instead.
 */
import {
  Body,
  Ecliptic,
  GeoMoon,
  GeoVector,
  SiderealTime,
} from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

const RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

export type Placement = {
  sign: string;
  glyph: string;
  /** 0–29.99 within the sign */
  degree: number;
  /** 0–359.99 ecliptic longitude */
  longitude: number;
};

export type NatalChart = {
  sun: Placement;
  moon: Placement;
  ascendant: Placement;
  dominant: { name: string; sign: string; glyph: string };
  /** Inputs echoed back so callers can persist them */
  meta: {
    isoDate: string;
    lat: number;
    lon: number;
  };
};

export type BirthInput = {
  /** Local birth datetime, ISO string (e.g. '1995-05-20T08:30:00') */
  isoLocal: string;
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees, east positive */
  lon: number;
  /** Timezone offset in MINUTES east of UTC. 330 for IST. */
  tzOffsetMinutes: number;
};

/** Convert a longitude in degrees to a sign + within-sign degree. */
function eclipticToSign(longitude: number): Placement {
  const norm = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[idx];
  return {
    sign,
    glyph: ZODIAC_GLYPHS[sign],
    degree: norm - idx * 30,
    longitude: norm,
  };
}

function toUTC({ isoLocal, tzOffsetMinutes }: BirthInput): Date {
  // isoLocal has no tz info; treat as wall-clock and subtract offset.
  const local = new Date(isoLocal);
  return new Date(local.getTime() - tzOffsetMinutes * 60_000);
}

/** Mean obliquity of the ecliptic (degrees), good enough for sign-level work. */
function meanObliquity(): number {
  return 23.4392911;
}

/** Compute the rising sign (ascendant) from local sidereal time + latitude. */
function computeAscendant(utc: Date, lat: number, lon: number): Placement {
  // Greenwich apparent sidereal time in hours -> degrees.
  const gstHours = SiderealTime(utc);
  // Local sidereal time in degrees (lon is east-positive).
  const lstDeg = (((gstHours * 15) + lon) % 360 + 360) % 360;
  const ramcRad = (lstDeg * Math.PI) / 180;
  const epsRad = (meanObliquity() * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Standard ascendant formula (Meeus Ch. 14, applied with atan2 for quadrant).
  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad)),
  );
  let ascDeg = (ascRad * 180) / Math.PI;
  if (ascDeg < 0) ascDeg += 360;
  return eclipticToSign(ascDeg);
}

function eclipticOf(body: typeof Body[keyof typeof Body], date: Date): Placement {
  const vec = GeoVector(body, date, false);
  const ecl = Ecliptic(vec);
  return eclipticToSign(ecl.elon);
}

function moonPlacement(date: Date): Placement {
  const m = GeoMoon(date);
  const ecl = Ecliptic(m);
  return eclipticToSign(ecl.elon);
}

/** Compute a complete natal chart. */
export function computeNatalChart(input: BirthInput): NatalChart {
  const utc = toUTC(input);

  const sun = eclipticOf(Body.Sun, utc);
  const moon = moonPlacement(utc);
  const ascendant = computeAscendant(utc, input.lat, input.lon);

  // Dominant: pick the planet ruling whichever of sun/moon/asc has the lowest
  // degree-into-sign (i.e. the freshest ingress) — a cheap heuristic that
  // happens to look reasonable on the UI.
  const candidates: { sign: string; degree: number }[] = [sun, moon, ascendant];
  const fresh = candidates.reduce((a, b) => (a.degree < b.degree ? a : b));
  const dominantPlanet = RULERS[fresh.sign] ?? 'Sun';

  return {
    sun,
    moon,
    ascendant,
    dominant: {
      name: dominantPlanet,
      sign: fresh.sign,
      glyph: ZODIAC_GLYPHS[fresh.sign],
    },
    meta: {
      isoDate: utc.toISOString(),
      lat: input.lat,
      lon: input.lon,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Transits                                                                   */
/* -------------------------------------------------------------------------- */

export type TransitingPlanet =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn';

export type NatalPoint = 'sun' | 'moon' | 'ascendant';

export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition';

export type Transit = {
  transiting: TransitingPlanet;
  natal: NatalPoint;
  aspect: AspectType;
  /** Distance from the exact aspect angle in degrees. 0 = exact. */
  orb: number;
  /** 0..1 score; closer to exact and stronger aspect rank higher. */
  strength: number;
  /** Sign the transiting planet sits in today. */
  transitingSign: string;
};

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

// Tighter orbs for minor aspects, wider for the big three. Empirically a
// good compromise for a single daily reading.
const ASPECT_ORBS: Record<AspectType, number> = {
  conjunction: 6,
  opposition: 6,
  trine: 6,
  square: 5,
  sextile: 4,
};

const TRANSITING_BODIES: { name: TransitingPlanet; body: typeof Body[keyof typeof Body] }[] = [
  { name: 'Sun', body: Body.Sun },
  { name: 'Moon', body: Body.Moon },
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
];

function planetLongitude(body: typeof Body[keyof typeof Body], date: Date): number {
  if (body === Body.Moon) {
    return Ecliptic(GeoMoon(date)).elon;
  }
  const vec = GeoVector(body, date, false);
  return Ecliptic(vec).elon;
}

function angularSeparation(a: number, b: number): number {
  const diff = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  // ↑ folded to [0, 180]
  return diff;
}

function rankPlanetWeight(p: TransitingPlanet): number {
  // Outer planets carry more karmic weight in a daily reading; the Moon is
  // weighted slightly down because its aspects rotate quickly through the day.
  switch (p) {
    case 'Saturn':
      return 1.0;
    case 'Jupiter':
      return 0.95;
    case 'Mars':
      return 0.9;
    case 'Venus':
      return 0.9;
    case 'Mercury':
      return 0.85;
    case 'Sun':
      return 0.85;
    case 'Moon':
      return 0.75;
  }
}

function aspectWeight(a: AspectType): number {
  switch (a) {
    case 'conjunction':
      return 1.0;
    case 'opposition':
      return 0.95;
    case 'trine':
      return 0.9;
    case 'square':
      return 0.9;
    case 'sextile':
      return 0.8;
  }
}

/**
 * Synastry: aspects between the planets in chart A and the planets in
 * chart B. Used to score romantic / interpersonal compatibility.
 */
export type SynastryPlanet =
  | TransitingPlanet
  | 'Ascendant';

export type SynastryAspect = {
  bodyA: SynastryPlanet;
  bodyB: SynastryPlanet;
  aspect: AspectType;
  /** Distance from exact aspect angle in degrees. 0 = exact. */
  orb: number;
  /** -1 (very tense) .. +1 (very harmonious). */
  signedStrength: number;
};

const PLANET_WEIGHTS: Record<SynastryPlanet, number> = {
  Sun: 1.0,
  Moon: 1.0,
  Ascendant: 0.95,
  Venus: 0.95,
  Mars: 0.9,
  Mercury: 0.85,
  Jupiter: 0.8,
  Saturn: 0.8,
};

const ASPECT_POLARITY: Record<AspectType, number> = {
  // Conjunctions are valence-by-pair; we treat them as mildly positive by
  // default and let the planet-pair adjustment pull the cases that hurt
  // (Mars-Saturn, etc.) into negative territory.
  conjunction: 0.55,
  trine: 1.0,
  sextile: 0.85,
  square: -1.0,
  opposition: -0.85,
};

/** Heavy-handed hand-tuned table — the pairs people care about most. */
const PAIR_NUDGE: Partial<Record<`${SynastryPlanet}-${SynastryPlanet}`, number>> = {
  'Sun-Moon': 0.45,
  'Moon-Sun': 0.45,
  'Venus-Mars': 0.3,
  'Mars-Venus': 0.3,
  'Sun-Venus': 0.2,
  'Venus-Sun': 0.2,
  'Moon-Venus': 0.2,
  'Venus-Moon': 0.2,
  // Mars-Saturn conjunctions and squares are notoriously friction-heavy.
  'Mars-Saturn': -0.35,
  'Saturn-Mars': -0.35,
  'Sun-Saturn': -0.15,
  'Saturn-Sun': -0.15,
};

const SYNASTRY_BODIES: { name: SynastryPlanet; pick: (c: NatalChart) => number }[] = [
  { name: 'Sun', pick: (c) => c.sun.longitude },
  { name: 'Moon', pick: (c) => c.moon.longitude },
  { name: 'Ascendant', pick: (c) => c.ascendant.longitude },
];

const SYNASTRY_TRANSITING: { name: SynastryPlanet; body: typeof Body[keyof typeof Body] }[] = [
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
];

function chartLongitudes(chart: NatalChart): { name: SynastryPlanet; lon: number }[] {
  const out: { name: SynastryPlanet; lon: number }[] = SYNASTRY_BODIES.map((b) => ({
    name: b.name,
    lon: b.pick(chart),
  }));
  // For non-Sun/Moon/Asc planets we re-derive longitudes from the chart's
  // birth datetime — kept here rather than persisting them on NatalChart so
  // the chart object stays small and serializable.
  const utc = new Date(chart.meta.isoDate);
  for (const sp of SYNASTRY_TRANSITING) {
    out.push({ name: sp.name, lon: planetLongitude(sp.body, utc) });
  }
  return out;
}

export function computeSynastry(
  chartA: NatalChart,
  chartB: NatalChart,
): { aspects: SynastryAspect[]; score: number } {
  const aLons = chartLongitudes(chartA);
  const bLons = chartLongitudes(chartB);

  const aspects: SynastryAspect[] = [];
  let signedSum = 0;
  let weightSum = 0;

  for (const a of aLons) {
    for (const b of bLons) {
      const sep = angularSeparation(a.lon, b.lon);
      for (const aspect of Object.keys(ASPECT_ANGLES) as AspectType[]) {
        const orb = Math.abs(sep - ASPECT_ANGLES[aspect]);
        if (orb > ASPECT_ORBS[aspect]) continue;
        const closeness = 1 - orb / ASPECT_ORBS[aspect]; // 0..1
        const planetWeight = PLANET_WEIGHTS[a.name] * PLANET_WEIGHTS[b.name];
        const polarity = ASPECT_POLARITY[aspect];
        const nudge = PAIR_NUDGE[`${a.name}-${b.name}` as keyof typeof PAIR_NUDGE] ?? 0;
        const signed = (polarity + nudge) * closeness;
        aspects.push({
          bodyA: a.name,
          bodyB: b.name,
          aspect,
          orb,
          signedStrength: signed,
        });
        signedSum += signed * planetWeight;
        weightSum += planetWeight;
      }
    }
  }

  // Normalize: the typical chart pair produces ~12-25 aspects in orb. Map
  // the signed mean (~ -1..+1) onto a 0..100 score with a soft cap so neither
  // extreme is ever reachable (keeps "10%" / "100%" off the UI).
  const mean = weightSum === 0 ? 0 : signedSum / weightSum;
  const raw = 50 + mean * 45;
  const score = Math.round(Math.max(20, Math.min(95, raw)));

  // Sort highest-impact aspects first for downstream prose.
  aspects.sort((x, y) => Math.abs(y.signedStrength) - Math.abs(x.signedStrength));

  return { aspects, score };
}

/**
 * Compute every aspect within orb between the major transiting planets and
 * the natal Sun / Moon / Ascendant on the given date. Sorted by strength,
 * strongest first.
 */
export function computeTransits(chart: NatalChart, when: Date): Transit[] {
  const natalPoints: { name: NatalPoint; lon: number }[] = [
    { name: 'sun', lon: chart.sun.longitude },
    { name: 'moon', lon: chart.moon.longitude },
    { name: 'ascendant', lon: chart.ascendant.longitude },
  ];

  const out: Transit[] = [];
  for (const tp of TRANSITING_BODIES) {
    const lon = planetLongitude(tp.body, when);
    const transitingSign = eclipticToSign(lon).sign;
    for (const np of natalPoints) {
      const sep = angularSeparation(lon, np.lon);
      for (const aspect of Object.keys(ASPECT_ANGLES) as AspectType[]) {
        const orb = Math.abs(sep - ASPECT_ANGLES[aspect]);
        if (orb <= ASPECT_ORBS[aspect]) {
          const closeness = 1 - orb / ASPECT_ORBS[aspect]; // 0..1
          const strength =
            closeness * aspectWeight(aspect) * rankPlanetWeight(tp.name);
          out.push({
            transiting: tp.name,
            natal: np.name,
            aspect,
            orb,
            strength,
            transitingSign,
          });
        }
      }
    }
  }

  out.sort((a, b) => b.strength - a.strength);
  return out;
}
