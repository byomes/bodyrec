'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getData } from '@/lib/storage';
import { Entry, Settings } from '@/lib/types';
import { useProfile } from '@/context/ProfileContext';
import { StatsChart } from '@/components/StatsChart';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-100">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function ChangeRow({
  label, current, previous, unit, lowerIsBetter = false,
}: {
  label: string; current: number; previous: number; unit: string; lowerIsBetter?: boolean;
}) {
  const d = Math.round((current - previous) * 10) / 10;
  const isGood = lowerIsBetter ? d < 0 : d > 0;
  const isNeutral = d === 0;
  const sign = d > 0 ? '+' : '';
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-200">{current}{unit}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isNeutral ? 'bg-gray-800 text-gray-500'
            : isGood ? 'bg-green-900/50 text-green-400'
            : 'bg-red-900/50 text-red-400'
        }`}>
          {sign}{d}{unit}
        </span>
      </div>
    </div>
  );
}

function GoalBar({ label, current, goal, firstValue, unit }: {
  label: string; current: number; goal: number; firstValue: number; unit: string;
}) {
  const lowerIsBetter = firstValue >= goal;
  const isGoalMet = lowerIsBetter ? current <= goal : current >= goal;
  let progress = 0;
  const range = Math.abs(firstValue - goal);
  if (range > 0) progress = Math.max(0, Math.min(1, Math.abs(firstValue - current) / range));
  if (isGoalMet) progress = 1;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={isGoalMet ? 'text-green-400 font-medium' : 'text-gray-300'}>
          {current}{unit} → {goal}{unit}{isGoalMet && ' ✓'}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isGoalMet ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useProfile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<Settings>({ height: null, goalFatPercent: null, goalWeight: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getData(profile)
      .then((data) => {
        if (cancelled) return;
        setEntries(data.entries);
        setSettings(data.settings);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load data. Check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profile]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);
  const first = sorted.at(0);
  const hasGoals = settings.goalFatPercent !== null || settings.goalWeight !== null;
  const profileName = profile === 'bill' ? 'Bill' : 'Mel';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {!latest ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">No data for {profileName}</h2>
          <p className="text-gray-500 mb-6">Log the first weigh-in to start tracking.</p>
          <Link href="/log" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors text-base">
            Log First Entry
          </Link>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Current Stats
              <span className="ml-2 text-gray-600 normal-case font-normal">{latest.date}</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Weight" value={latest.weight} unit="lbs" />
              <StatCard label="Body Fat" value={latest.fatPercent} unit="%" />
              <StatCard label="Fat Mass" value={latest.fatLbs} unit="lbs" />
              <StatCard label="Lean Mass" value={latest.leanLbs} unit="lbs" />
            </div>
          </section>

          {previous ? (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Change from Last Entry</h2>
              <div className="bg-gray-900 rounded-xl px-4 border border-gray-800">
                <ChangeRow label="Weight" current={latest.weight} previous={previous.weight} unit=" lbs" />
                <ChangeRow label="Body Fat" current={latest.fatPercent} previous={previous.fatPercent} unit="%" lowerIsBetter />
                <ChangeRow label="Fat Mass" current={latest.fatLbs} previous={previous.fatLbs} unit=" lbs" lowerIsBetter />
                <ChangeRow label="Lean Mass" current={latest.leanLbs} previous={previous.leanLbs} unit=" lbs" />
              </div>
            </section>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center text-gray-500 text-sm">
              Log one more entry to see week-over-week changes.
            </div>
          )}

          {hasGoals && first && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Goal Progress</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
                {settings.goalFatPercent !== null && (
                  <GoalBar label="Body Fat" current={latest.fatPercent} goal={settings.goalFatPercent} firstValue={first.fatPercent} unit="%" />
                )}
                {settings.goalWeight !== null && (
                  <GoalBar label="Weight" current={latest.weight} goal={settings.goalWeight} firstValue={first.weight} unit=" lbs" />
                )}
              </div>
            </section>
          )}

          {sorted.length >= 2 ? (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trends</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <StatsChart entries={sorted} />
              </div>
            </section>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center text-gray-500 text-sm">
              Log at least 2 entries to see your trend chart.
            </div>
          )}

          <Link href="/log" className="block w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-center px-6 py-3.5 rounded-xl font-semibold transition-colors text-base">
            + Log New Entry
          </Link>
        </>
      )}
    </div>
  );
}
