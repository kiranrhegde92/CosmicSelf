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
