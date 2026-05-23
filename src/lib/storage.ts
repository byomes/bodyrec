import { supabase } from './supabase';
import { Entry, Settings, Profile, RecompData } from './types';

// ── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: any): Entry {
  return {
    id: row.id,
    date: row.date,
    weight: Number(row.weight),
    neck: Number(row.neck),
    waist: Number(row.waist),
    hip: row.hip != null ? Number(row.hip) : undefined,
    height: Number(row.height),
    fatPercent: Number(row.fat_percent),
    fatLbs: Number(row.fat_lbs),
    leanLbs: Number(row.lean_lbs),
    notes: row.notes ?? '',
  };
}

function entryToRow(entry: Entry, profile: Profile) {
  return {
    id: entry.id,
    profile,
    date: entry.date,
    weight: entry.weight,
    neck: entry.neck,
    waist: entry.waist,
    hip: entry.hip ?? null,
    height: entry.height,
    fat_percent: entry.fatPercent,
    fat_lbs: entry.fatLbs,
    lean_lbs: entry.leanLbs,
    notes: entry.notes ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(row: any): Settings {
  return {
    height: row.height != null ? Number(row.height) : null,
    goalFatPercent: row.goal_fat_percent != null ? Number(row.goal_fat_percent) : null,
    goalWeight: row.goal_weight != null ? Number(row.goal_weight) : null,
  };
}

function settingsToRow(settings: Settings, profile: Profile) {
  return {
    profile,
    height: settings.height,
    goal_fat_percent: settings.goalFatPercent,
    goal_weight: settings.goalWeight,
  };
}

const defaultSettings: Settings = { height: null, goalFatPercent: null, goalWeight: null };

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getEntries(profile: Profile): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('profile', profile)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToEntry);
}

export async function getSettings(profile: Profile): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('profile', profile)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSettings(data) : { ...defaultSettings };
}

export async function getData(profile: Profile): Promise<RecompData> {
  const [entries, settings] = await Promise.all([
    getEntries(profile),
    getSettings(profile),
  ]);
  return { entries, settings };
}

export async function findEntryByDate(
  date: string,
  profile: Profile,
  excludeId?: string
): Promise<Entry | null> {
  let query = supabase
    .from('entries')
    .select('*')
    .eq('profile', profile)
    .eq('date', date);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query.maybeSingle();
  return data ? rowToEntry(data) : null;
}

export async function findEntryById(id: string, profile: Profile): Promise<Entry | null> {
  const { data } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('profile', profile)
    .maybeSingle();
  return data ? rowToEntry(data) : null;
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function saveEntry(entry: Entry, profile: Profile): Promise<void> {
  const { error } = await supabase
    .from('entries')
    .upsert(entryToRow(entry, profile), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteEntry(id: string, profile: Profile): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id).eq('profile', profile);
  if (error) throw error;
}

export async function saveSettings(settings: Settings, profile: Profile): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert(settingsToRow(settings, profile), { onConflict: 'profile' });
  if (error) throw error;
}

export async function clearAllData(profile: Profile): Promise<void> {
  const [r1, r2] = await Promise.all([
    supabase.from('entries').delete().eq('profile', profile),
    supabase.from('settings').delete().eq('profile', profile),
  ]);
  if (r1.error) throw r1.error;
  if (r2.error) throw r2.error;
}

// ── Migration ─────────────────────────────────────────────────────────────────

export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  const profiles: Profile[] = ['bill', 'mel'];

  for (const profile of profiles) {
    const key = `recomp-data-${profile}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const local = JSON.parse(raw) as RecompData;

      if (local.entries?.length) {
        await supabase
          .from('entries')
          .upsert(local.entries.map((e) => entryToRow(e, profile)), { onConflict: 'id' });
      }

      if (local.settings) {
        await supabase
          .from('settings')
          .upsert(settingsToRow(local.settings, profile), { onConflict: 'profile' });
      }

      localStorage.removeItem(key);
    } catch (err) {
      console.error(`bodyrec: localStorage migration failed for ${profile}:`, err);
      // Leave the localStorage key intact so it can be retried
    }
  }

  // Clean up legacy key
  localStorage.removeItem('recomp-data');
}
