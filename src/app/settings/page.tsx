'use client';
import { useEffect, useState } from 'react';
import { getData, saveSettings, clearAllData } from '@/lib/storage';
import { Settings } from '@/lib/types';
import { useProfile } from '@/context/ProfileContext';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-gray-100 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
const labelClass = 'block text-sm font-medium text-gray-400 mb-1.5';

export default function SettingsPage() {
  const { profile } = useProfile();
  const [settings, setSettings] = useState<Settings>({
    height: null,
    goalFatPercent: null,
    goalWeight: null,
  });
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getData(profile);
    setSettings(data.settings);
    setSaved(false);
    setConfirmClear(false);
    setCleared(false);
    setLoaded(true);
  }, [profile]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings(settings, profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    clearAllData(profile);
    setConfirmClear(false);
    setCleared(true);
    setSettings({ height: null, goalFatPercent: null, goalWeight: null });
  }

  function numVal(v: number | null) {
    return v === null ? '' : String(v);
  }

  function parseNum(v: string): number | null {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  if (!loaded) return null;

  const profileName = profile === 'bill' ? 'Bill' : 'Mel';

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-100 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">{profileName}&apos;s profile</p>

      <form onSubmit={handleSave} className="space-y-5">
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Profile</h2>
          <div>
            <label className={labelClass}>Height (inches)</label>
            <input
              type="number"
              value={numVal(settings.height)}
              onChange={(e) => setSettings((s) => ({ ...s, height: parseNum(e.target.value) }))}
              placeholder="e.g. 71"
              step="0.5"
              min="48"
              max="96"
              className={inputClass}
              inputMode="decimal"
            />
            <p className="mt-1 text-xs text-gray-600">Pre-filled in the log form after first entry.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Goals</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Target Body Fat %</label>
              <input
                type="number"
                value={numVal(settings.goalFatPercent)}
                onChange={(e) => setSettings((s) => ({ ...s, goalFatPercent: parseNum(e.target.value) }))}
                placeholder="e.g. 18"
                step="0.1"
                min="3"
                max="50"
                className={inputClass}
                inputMode="decimal"
              />
            </div>
            <div>
              <label className={labelClass}>Target Weight (lbs)</label>
              <input
                type="number"
                value={numVal(settings.goalWeight)}
                onChange={(e) => setSettings((s) => ({ ...s, goalWeight: parseNum(e.target.value) }))}
                placeholder="e.g. 195"
                step="0.5"
                min="50"
                max="500"
                className={inputClass}
                inputMode="decimal"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className={`w-full py-3.5 rounded-xl font-semibold text-base transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
          }`}
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>

      <section className="mt-10 pt-6 border-t border-gray-800">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Danger Zone</h2>
        {cleared ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center text-gray-400 text-sm">
            All data for {profileName} cleared.
          </div>
        ) : confirmClear ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 space-y-3">
            <p className="text-red-300 text-sm font-medium">
              This will permanently delete all of {profileName}&apos;s entries and settings. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="w-full bg-transparent border border-red-800 hover:bg-red-900/20 text-red-400 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Clear {profileName}&apos;s Data
          </button>
        )}
      </section>
    </div>
  );
}
