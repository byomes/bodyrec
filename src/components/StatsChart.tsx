'use client';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Entry } from '@/lib/types';

const SERIES = [
  { key: 'weight' as const, label: 'Weight', color: '#3b82f6' },
  { key: 'fatPercent' as const, label: 'Fat %', color: '#f97316' },
  { key: 'fatLbs' as const, label: 'Fat Lbs', color: '#ef4444' },
  { key: 'leanLbs' as const, label: 'Lean Lbs', color: '#22c55e' },
];

type SeriesKey = 'weight' | 'fatPercent' | 'fatLbs' | 'leanLbs';

interface StatsChartProps {
  entries: Entry[];
}

export function StatsChart({ entries }: StatsChartProps) {
  const [active, setActive] = useState<Set<SeriesKey>>(
    new Set(['weight', 'fatPercent'] as SeriesKey[])
  );

  const data = entries.map((e) => ({
    date: e.date.slice(5),
    weight: e.weight,
    fatPercent: e.fatPercent,
    fatLbs: e.fatLbs,
    leanLbs: e.leanLbs,
  }));

  function toggle(key: SeriesKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              active.has(s.key)
                ? 'text-white border-transparent'
                : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
            }`}
            style={active.has(s.key) ? { backgroundColor: s.color, borderColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            />
            {SERIES.filter((s) => active.has(s.key)).map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name={s.label}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
