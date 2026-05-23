export interface Entry {
  id: string;
  date: string;
  weight: number;
  neck: number;
  waist: number;
  height: number;
  fatPercent: number;
  fatLbs: number;
  leanLbs: number;
  notes: string;
}

export interface Settings {
  height: number | null;
  goalFatPercent: number | null;
  goalWeight: number | null;
}

export interface RecompData {
  entries: Entry[];
  settings: Settings;
}
