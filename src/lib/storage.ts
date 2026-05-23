import { RecompData, Entry, Settings, Profile } from './types';

const OLD_KEY = 'recomp-data';

function profileKey(profile: Profile): string {
  return `recomp-data-${profile}`;
}

const defaultData: RecompData = {
  entries: [],
  settings: { height: null, goalFatPercent: null, goalWeight: null },
};

export function migrateIfNeeded(): void {
  if (typeof window === 'undefined') return;
  const old = localStorage.getItem(OLD_KEY);
  if (!old) return;
  if (!localStorage.getItem(profileKey('bill'))) {
    localStorage.setItem(profileKey('bill'), old);
  }
  localStorage.removeItem(OLD_KEY);
}

export function getData(profile: Profile): RecompData {
  if (typeof window === 'undefined') return structuredClone(defaultData);
  try {
    const raw = localStorage.getItem(profileKey(profile));
    if (!raw) return structuredClone(defaultData);
    return JSON.parse(raw) as RecompData;
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(data: RecompData, profile: Profile): void {
  localStorage.setItem(profileKey(profile), JSON.stringify(data));
}

export function findEntryByDate(date: string, profile: Profile): Entry | null {
  return getData(profile).entries.find((e) => e.date === date) ?? null;
}

export function findEntryById(id: string, profile: Profile): Entry | null {
  return getData(profile).entries.find((e) => e.id === id) ?? null;
}

export function saveEntry(entry: Entry, profile: Profile): void {
  const data = getData(profile);
  const idx = data.entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    data.entries[idx] = entry;
  } else {
    data.entries.push(entry);
  }
  saveData(data, profile);
}

export function deleteEntry(id: string, profile: Profile): void {
  const data = getData(profile);
  data.entries = data.entries.filter((e) => e.id !== id);
  saveData(data, profile);
}

export function saveSettings(settings: Settings, profile: Profile): void {
  const data = getData(profile);
  data.settings = settings;
  saveData(data, profile);
}

export function clearAllData(profile: Profile): void {
  localStorage.removeItem(profileKey(profile));
}
