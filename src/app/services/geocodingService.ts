import { env } from '../config/env';

export type GeocodedPlace = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  lat: number;
  lon: number;
  /** Timezone offset in minutes east of UTC, when the API can supply it. */
  tzOffsetMinutes?: number;
  /** IANA tz name when available */
  timezone?: string;
};

type RawHit = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
};

export const geocodingService = {
  /**
   * Search for cities/places matching `query`. Uses Open-Meteo's free
   * geocoding endpoint — no API key required.
   */
  async search(query: string, limit = 8): Promise<GeocodedPlace[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const url = `${env.geocoding.endpoint}?name=${encodeURIComponent(trimmed)}&count=${limit}&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: RawHit[] };
    return (json.results ?? []).map(toPlace);
  },
};

function toPlace(r: RawHit): GeocodedPlace {
  return {
    id: String(r.id),
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    lat: r.latitude,
    lon: r.longitude,
    timezone: r.timezone,
    tzOffsetMinutes: tzNameToOffsetMinutes(r.timezone),
  };
}

/**
 * Resolve an IANA tz name to a current UTC offset in minutes by formatting
 * `now` in that tz and diffing against UTC. Imperfect for historical births
 * (no DST history) but fine for chart UI.
 */
function tzNameToOffsetMinutes(name?: string): number | undefined {
  if (!name) return undefined;
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: name,
      timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(now);
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    // tz looks like "GMT+5:30" or "GMT-04"
    const m = tz.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    const h = parseInt(m[2], 10);
    const min = parseInt(m[3] ?? '0', 10);
    return sign * (h * 60 + min);
  } catch {
    return undefined;
  }
}
