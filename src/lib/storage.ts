import { RecompData, Entry, Settings } from './types';

const STORAGE_KEY = 'recomp-data';

const defaultData: RecompData = {
  entries: [],
  settings: { height: null, goalFatPercent: null, goalWeight: null },
};

export function getData(): RecompData {
  if (typeof window === 'undefined') return structuredClone(defaultData);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    return JSON.parse(raw) as RecompData;
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(data: RecompData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function findEntryByDate(date: string): Entry | null {
  return getData().entries.find((e) => e.date === date) ?? null;
}

export function findEntryById(id: string): Entry | null {
  return getData().entries.find((e) => e.id === id) ?? null;
}

export function saveEntry(entry: Entry): void {
  const data = getData();
  const idx = data.entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    data.entries[idx] = entry;
  } else {
    data.entries.push(entry);
  }
  saveData(data);
}

export function deleteEntry(id: string): void {
  const data = getData();
  data.entries = data.entries.filter((e) => e.id !== id);
  saveData(data);
}

export function saveSettings(settings: Settings): void {
  const data = getData();
  data.settings = settings;
  saveData(data);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
