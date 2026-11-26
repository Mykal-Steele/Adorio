'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesPoint } from '../../api/types/analytics';
import { bucketLabel, formatNumber } from './format';

export type Metric = 'visitors' | 'pageViews';

const LABEL: Record<Metric, string> = { visitors: 'Unique visitors', pageViews: 'Page views' };
// paper accent, checked against the cream card with the dataviz palette validator
const LINE = '#a8801a';
const INK = '#2b2723';
const MUTED = '#5c544a';
const GRID = 'rgba(60, 44, 24, 0.15)';

type Unit = 'hour' | 'day' | 'month';

function ChartTooltip({
  active,
  payload,
  unit,
  metric,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  unit: Unit;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as SeriesPoint;
  return (
    <div className="rounded-[6px] border border-[var(--paper-line)] bg-[var(--paper-cream)] px-3 py-2 text-xs shadow-[0_2px_6px_rgba(60,44,24,.2)]">
      <p className="font-paper-sans font-semibold">{bucketLabel(point.bucket, unit, true)}</p>
      <p className="mt-1 [font-variant-numeric:lining-nums_tabular-nums]">
        <span
          aria-hidden
          className="mr-1.5 inline-block h-2 w-2 rounded-full"
          style={{ background: LINE }}
        />
        {LABEL[metric]}: <strong>{formatNumber(point[metric])}</strong>
      </p>
    </div>
  );
}

export function TrendChart({
  series,
  unit,
  metric,
  loading,
}: {
  series: SeriesPoint[];
  unit: Unit;
  metric: Metric;
  loading: boolean;
}) {
  const empty = !loading && series.every((p) => p[metric] === 0);

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        {LABEL[metric]} per {unit}
      </figcaption>
      <div className="relative h-[260px]">
        {loading ? (
          <div className="h-full rounded-[3px] bg-[var(--paper-hero)]" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LINE} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={LINE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="bucket"
                tickFormatter={(b: string) => bucketLabel(b, unit)}
                tick={{ fill: MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: INK, strokeWidth: 1, strokeDasharray: '3 3' }}
                content={(props) => <ChartTooltip {...props} unit={unit} metric={metric} />}
              />
              <Area
                type="monotone"
                dataKey={metric}
                name={LABEL[metric]}
                stroke={LINE}
                strokeWidth={2}
                fill="url(#trend-fill)"
                activeDot={{ r: 4, fill: LINE, stroke: '#fdfaf3', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {empty ? (
          <p className="absolute inset-0 grid place-items-center text-sm text-[var(--paper-muted-2)]">
            No visits in this period yet.
          </p>
        ) : null}
      </div>
      {!loading ? (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-paper-sans text-[var(--paper-muted)]">
            Show as a table
          </summary>
          <div className="mt-2 max-h-60 overflow-auto">
            <table className="w-full border-collapse font-paper-sans [font-variant-numeric:lining-nums_tabular-nums]">
              <thead>
                <tr className="text-left text-[var(--paper-muted-2)]">
                  <th className="py-1 pr-4 font-normal">
                    {unit === 'hour' ? 'Hour' : unit === 'day' ? 'Day' : 'Month'}
                  </th>
                  <th className="py-1 pr-4 text-right font-normal">Visitors</th>
                  <th className="py-1 text-right font-normal">Page views</th>
                </tr>
              </thead>
              <tbody>
                {series.map((p) => (
                  <tr key={p.bucket} className="border-t border-[var(--paper-line)]">
                    <td className="py-1 pr-4">{bucketLabel(p.bucket, unit, true)}</td>
                    <td className="py-1 pr-4 text-right">{formatNumber(p.visitors)}</td>
                    <td className="py-1 text-right">{formatNumber(p.pageViews)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </figure>
  );
}
