import { Country, CommitteeSettings, Motion, VoteRecord, Speaker } from '../types';
import { INITIAL_COUNTRIES, DEFAULT_COMMITTEE_SETTINGS } from '../data/oicCountries';

const STORAGE_KEYS = {
  COUNTRIES: 'moic_countries_v2',
  SETTINGS: 'moic_settings_v2',
  GSL_SPEAKERS: 'moic_gsl_speakers_v2',
  GSL_TIME: 'moic_gsl_time_v2',
  MOTIONS: 'moic_motions_v2',
  VOTES: 'moic_votes_v2',
  UNMOD_NOTES: 'moic_unmod_notes_v2',
};

export interface ExportedSessionData {
  version: string;
  exportedAt: string;
  settings: CommitteeSettings;
  countries: Country[];
  gslSpeakers: Speaker[];
  motions: Motion[];
  votes: VoteRecord[];
  unmodNotes: string;
}

export function loadSettings(): CommitteeSettings {
  try {
    // Purge legacy storage cache if present
    localStorage.removeItem('moic_settings_v1');
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.chairName && parsed.chairName.includes('Siayam')) {
        parsed.chairName = DEFAULT_COMMITTEE_SETTINGS.chairName;
      }
      if (
        parsed.coChairName &&
        (parsed.coChairName.includes('Adnan') || parsed.coChairName.includes('Razi'))
      ) {
        parsed.coChairName = DEFAULT_COMMITTEE_SETTINGS.coChairName;
      }
      return { ...DEFAULT_COMMITTEE_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_COMMITTEE_SETTINGS;
}

export function saveSettings(settings: CommitteeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadCountries(): Country[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_COUNTRIES;
}

export function saveCountries(countries: Country[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
  } catch {
    // ignore
  }
}

export function loadGslSpeakers(): Speaker[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GSL_SPEAKERS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [];
}

export function saveGslSpeakers(speakers: Speaker[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GSL_SPEAKERS, JSON.stringify(speakers));
  } catch {
    // ignore
  }
}

export function loadMotions(): Motion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOTIONS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [];
}

export function saveMotions(motions: Motion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOTIONS, JSON.stringify(motions));
  } catch {
    // ignore
  }
}

export function loadVotes(): VoteRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VOTES);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [];
}

export function saveVotes(votes: VoteRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  } catch {
    // ignore
  }
}

export function exportFullSession(
  settings: CommitteeSettings,
  countries: Country[],
  gslSpeakers: Speaker[],
  motions: Motion[],
  votes: VoteRecord[],
  unmodNotes: string
): string {
  const payload: ExportedSessionData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    countries,
    gslSpeakers,
    motions,
    votes,
    unmodNotes,
  };
  return JSON.stringify(payload, null, 2);
}

export function resetAllSessionData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
