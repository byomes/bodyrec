'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getData, deleteEntry } from '@/lib/storage';
import { Entry } from '@/lib/types';
import { useProfile } from '@/context/ProfileContext';

function exportCSV(entries: Entry[], profileName: string) {
  const headers = ['Date', 'Weight (lbs)', 'Neck (in)', 'Waist (in)', 'Hip (in)', 'Height (in)', 'Fat %', 'Fat Lbs', 'Lean Lbs', 'Notes'];
  const rows = entries.map((e) => [
    e.date,
    e.weight,
    e.neck,
    e.waist,
    e.hip ?? '',
    e.height,
    e.fatPercent,
    e.fatLbs,
    e.leanLbs,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bodyrec-${profileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function fmt(val: number, decimals = 1) {
  return val.toFixed(decimals);
}

export default function HistoryPage() {
  const { profile } = useProfile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function load() {
    const data = getData(profile);
    const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
    setEntries(sorted);
    setLoaded(true);
  }

  useEffect(() => {
    setConfirmDeleteId(null);
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  function handleDelete(id: string) {
    deleteEntry(id, profile);
    setConfirmDeleteId(null);
    load();
  }

  if (!loaded) return null;

  const profileName = profile === 'bill' ? 'bill' : 'mel';

  // Build prev-entry map using chronological order
  const chrono = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const prevMap = new Map<string, Entry>();
  chrono.forEach((e, i) => {
    if (i > 0) prevMap.set(e.id, chrono[i - 1]);
  });

  function deltaStr(current: number, prev: Entry | undefined, key: keyof Entry): string {
    if (!prev) return '—';
    const d = Math.round(((current as number) - (prev[key] as number)) * 10) / 10;
    return (d > 0 ? '+' : '') + d;
  }

  function deltaColor(current: number, prev: Entry | undefined, key: keyof Entry, lowerIsBetter = false): string {
    if (!prev) return 'text-gray-600';
    const d = (current as number) - (prev[key] as number);
    if (d === 0) return 'text-gray-500';
    return (lowerIsBetter ? d < 0 : d > 0) ? 'text-green-400' : 'text-red-400';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-100">History</h1>
        {entries.length > 0 && (
          <button
            onClick={() => exportCSV(chrono, profileName)}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Export CSV
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No entries for {profile === 'bill' ? 'Bill' : 'Mel'} yet.</p>
          <Link
            href="/log"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Log First Entry
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {entries.map((e) => {
              const prev = prevMap.get(e.id);
              return (
                <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-200">{e.date}</span>
                    <div className="flex gap-2">
                      <Link
                        href={`/log?id=${e.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-900/30"
                      >
                        Edit
                      </Link>
                      {confirmDeleteId === e.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(e.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/20"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="text-gray-200">{fmt(e.weight)} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Body Fat</span>
                      <span className="text-gray-200">{fmt(e.fatPercent)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fat Lbs</span>
                      <span className="text-gray-200">{fmt(e.fatLbs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lean Lbs</span>
                      <span className="text-gray-200">{fmt(e.leanLbs)}</span>
                    </div>
                    {prev && (
                      <div className="flex justify-between col-span-2 pt-1 border-t border-gray-800 mt-1">
                        <span className="text-gray-500">vs prev</span>
                        <div className="flex gap-3">
                          <span className={deltaColor(e.weight, prev, 'weight')}>
                            {deltaStr(e.weight, prev, 'weight')} lbs
                          </span>
                          <span className={deltaColor(e.fatPercent, prev, 'fatPercent', true)}>
                            {deltaStr(e.fatPercent, prev, 'fatPercent')}%
                          </span>
                          <span className={deltaColor(e.leanLbs, prev, 'leanLbs')}>
                            {deltaStr(e.leanLbs, prev, 'leanLbs')} lean
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {e.notes && <p className="mt-2 text-xs text-gray-500 italic">{e.notes}</p>}
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Date', 'Weight', 'Neck', 'Waist', 'Fat %', 'Fat Lbs', 'Lean Lbs', 'Change', 'Notes', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider first:pl-0 last:pr-0"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const prev = prevMap.get(e.id);
                  return (
                    <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                      <td className="py-3 px-3 text-gray-300 font-medium pl-0">{e.date}</td>
                      <td className="py-3 px-3 text-gray-300">{fmt(e.weight)}</td>
                      <td className="py-3 px-3 text-gray-400">{fmt(e.neck)}</td>
                      <td className="py-3 px-3 text-gray-400">{fmt(e.waist)}</td>
                      <td className="py-3 px-3 text-gray-300">{fmt(e.fatPercent)}%</td>
                      <td className="py-3 px-3 text-gray-300">{fmt(e.fatLbs)}</td>
                      <td className="py-3 px-3 text-gray-300">{fmt(e.leanLbs)}</td>
                      <td className="py-3 px-3">
                        {prev ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-xs ${deltaColor(e.weight, prev, 'weight')}`}>
                              w: {deltaStr(e.weight, prev, 'weight')}
                            </span>
                            <span className={`text-xs ${deltaColor(e.fatPercent, prev, 'fatPercent', true)}`}>
                              f: {deltaStr(e.fatPercent, prev, 'fatPercent')}%
                            </span>
                            <span className={`text-xs ${deltaColor(e.leanLbs, prev, 'leanLbs')}`}>
                              l: {deltaStr(e.leanLbs, prev, 'leanLbs')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500 max-w-[160px] truncate">{e.notes}</td>
                      <td className="py-3 pr-0 pl-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/log?id=${e.id}`} className="text-blue-400 hover:text-blue-300 text-xs">
                            Edit
                          </Link>
                          {confirmDeleteId === e.id ? (
                            <>
                              <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-300 text-xs">
                                Confirm
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-gray-500 hover:text-gray-400 text-xs">
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(e.id)} className="text-red-500 hover:text-red-400 text-xs">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
