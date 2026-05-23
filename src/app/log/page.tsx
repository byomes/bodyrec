'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getData, saveEntry, findEntryByDate, findEntryById, deleteEntry, saveSettings } from '@/lib/storage';
import { calcFatPercent, calcFatLbs, calcLeanLbs } from '@/lib/calculations';
import { Entry } from '@/lib/types';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-gray-100 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';
const labelClass = 'block text-sm font-medium text-gray-400 mb-1.5';

function LogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<{
    fatPercent: number;
    fatLbs: number;
    leanLbs: number;
  } | null>(null);
  const [dateConflictId, setDateConflictId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = getData();
    if (data.settings.height) setHeight(String(data.settings.height));

    if (editId) {
      const entry = findEntryById(editId);
      if (entry) {
        setDate(entry.date);
        setWeight(String(entry.weight));
        setNeck(String(entry.neck));
        setWaist(String(entry.waist));
        setHeight(String(entry.height));
        setNotes(entry.notes || '');
      }
    }
  }, [editId]);

  // Live calculation preview
  useEffect(() => {
    const w = parseFloat(weight);
    const n = parseFloat(neck);
    const wa = parseFloat(waist);
    const h = parseFloat(height);
    if (w > 0 && n > 0 && wa > 0 && h > 0) {
      const fp = calcFatPercent(wa, n, h);
      if (fp !== null) {
        const fl = calcFatLbs(w, fp);
        const ll = calcLeanLbs(w, fl);
        setPreview({ fatPercent: fp, fatLbs: fl, leanLbs: ll });
        return;
      }
    }
    setPreview(null);
  }, [weight, neck, waist, height]);

  // Check for date conflicts
  useEffect(() => {
    if (!date) return;
    const existing = findEntryByDate(date);
    if (existing && existing.id !== editId) {
      setDateConflictId(existing.id);
    } else {
      setDateConflictId(null);
    }
  }, [date, editId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!preview) {
      setError('Please fill in all fields with valid values.');
      return;
    }

    const h = parseFloat(height);

    // If editing and date changed to a conflicting date, remove the conflict
    if (editId && dateConflictId) {
      deleteEntry(dateConflictId);
    }

    // Determine ID: editing → keep editId; conflict on new → reuse conflict id; else new uuid
    const id = editId ?? dateConflictId ?? uuidv4();

    const entry: Entry = {
      id,
      date,
      weight: parseFloat(weight),
      neck: parseFloat(neck),
      waist: parseFloat(waist),
      height: h,
      fatPercent: preview.fatPercent,
      fatLbs: preview.fatLbs,
      leanLbs: preview.leanLbs,
      notes,
    };

    // Sync height to settings
    const data = getData();
    if (data.settings.height !== h) {
      saveSettings({ ...data.settings, height: h });
    }

    saveEntry(entry);
    router.push('/');
  }

  const isOverwrite = !editId && !!dateConflictId;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-100 mb-6">
        {editId ? 'Edit Entry' : 'Log Entry'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
          {dateConflictId && (
            <p className="mt-1.5 text-sm text-yellow-400">
              An entry already exists for this date — saving will overwrite it.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Weight (lbs)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 210"
            step="0.1"
            min="50"
            max="500"
            className={inputClass}
            inputMode="decimal"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Neck circumference (inches)</label>
          <input
            type="number"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            placeholder="e.g. 16.5"
            step="0.1"
            min="5"
            max="30"
            className={inputClass}
            inputMode="decimal"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Waist circumference (inches)</label>
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="e.g. 38"
            step="0.1"
            min="20"
            max="80"
            className={inputClass}
            inputMode="decimal"
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Height (inches)
            <span className="ml-1 text-gray-600 font-normal text-xs">— saved to profile</span>
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 71"
            step="0.5"
            min="48"
            max="96"
            className={inputClass}
            inputMode="decimal"
            required
          />
        </div>

        {preview ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-400">{preview.fatPercent}%</div>
                <div className="text-xs text-gray-500 mt-0.5">Body Fat</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{preview.fatLbs}</div>
                <div className="text-xs text-gray-500 mt-0.5">Fat Lbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{preview.leanLbs}</div>
                <div className="text-xs text-gray-500 mt-0.5">Lean Lbs</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-4 text-center text-gray-600 text-sm">
            Fill in all measurements to see body fat estimate
          </div>
        )}

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this week…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base transition-colors mt-2"
        >
          {editId ? 'Save Changes' : isOverwrite ? 'Overwrite Entry' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={null}>
      <LogForm />
    </Suspense>
  );
}
