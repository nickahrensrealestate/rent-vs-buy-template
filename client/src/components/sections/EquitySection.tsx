/**
 * Section 03 — Equity Position
 * Precision Ledger Design System
 * Shows equity at 1, 3, 5, and 10 year milestones.
 * Compares standard vs. extra payment scenarios.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatPercent } from '@/lib/format';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { TrendingUp, Home, Layers } from 'lucide-react';

function EquityCard({
  years, equity, homeValue, loanBalance, equityPct,
  equityWithExtra, hasExtra,
}: {
  years: number;
  equity: number;
  homeValue: number;
  loanBalance: number;
  equityPct: number;
  equityWithExtra: number;
  hasExtra: boolean;
}) {
  const extraGain = equityWithExtra - equity;

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 navy-bg rounded flex items-center justify-center">
            <span className="text-white font-mono-data text-xs font-700">{years}Y</span>
          </div>
          <span className="font-display text-sm font-600 text-gray-800">
            {years === 1 ? '1 Year' : `${years} Years`}
          </span>
        </div>
        <span className="text-xs font-mono-data font-600 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {formatPercent(equityPct, 1)} equity
        </span>
      </div>

      {/* Equity bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Equity</span>
          <span className="text-xs text-gray-500">Loan Balance</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(equityPct, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Your Equity</span>
          <span className="font-mono-data text-sm font-700 gain-text">{formatCurrency(equity)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Home Value</span>
          <span className="font-mono-data text-sm font-600 text-blue-700">{formatCurrency(homeValue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Loan Balance</span>
          <span className="font-mono-data text-sm font-600 text-gray-600">{formatCurrency(loanBalance)}</span>
        </div>

        {hasExtra && extraGain > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span className="text-xs text-green-700 font-medium">Extra payment equity</span>
            <span className="font-mono-data text-sm font-700 text-green-700">
              +{formatCurrency(extraGain)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EquitySection() {
  const { inputs, derived } = useCalculator();
  const { equityMilestones } = derived;
  const hasExtra = inputs.extraMonthlyPayment > 0;

  // Chart data for equity growth over time
  const chartData = derived.amortizationSchedule
    .filter(row => row.month % 12 === 0)
    .map(row => ({
      year: row.year,
      'Equity (Standard)': Math.round(row.equity),
      'Home Value': Math.round(row.homeValue),
      'Loan Balance': Math.round(row.balance),
    }));

  const chartDataExtra = hasExtra
    ? derived.amortizationWithExtra
        .filter(row => row.month % 12 === 0)
        .map(row => ({
          year: row.year,
          'Equity (Extra Payments)': Math.round(row.equity),
        }))
    : [];

  // Merge chart data
  const mergedChartData = chartData.map((row, i) => ({
    ...row,
    ...(chartDataExtra[i] || {}),
  }));

  return (
    <section id="equity" className="py-12">
      <div className="section-divider mb-12" />

      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">03</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 03</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Equity Position</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Equity is the portion of your home you truly own. It grows as you pay down your mortgage and as your home appreciates. Here's where you stand at key milestones.
          </p>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {equityMilestones.map(m => (
          <EquityCard
            key={m.years}
            years={m.years}
            equity={m.equity}
            homeValue={m.homeValue}
            loanBalance={m.loanBalance}
            equityPct={m.equityPct}
            equityWithExtra={m.equityWithExtra}
            hasExtra={hasExtra}
          />
        ))}
      </div>

      {/* Equity growth chart */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">
          Equity Growth Over {inputs.loanTermYears} Years
          {hasExtra && <span className="text-green-600 ml-2 text-xs">(with extra payment comparison)</span>}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={mergedChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `Yr ${v}`}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div className="custom-tooltip">
                    <p className="font-semibold text-gray-700 mb-1">Year {label}</p>
                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }} className="font-mono-data text-xs">
                        {p.name}: {formatCurrency(p.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans' }} />
            <Line type="monotone" dataKey="Home Value" stroke="#1D4ED8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Equity (Standard)" stroke="#166534" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Loan Balance" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            {hasExtra && (
              <Line type="monotone" dataKey="Equity (Extra Payments)" stroke="#059669" strokeWidth={2.5} dot={false} strokeDasharray="6 2" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Equity vs. rent comparison callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-700" />
            <h4 className="font-display text-sm font-700 text-green-800">As a Homeowner at 10 Years</h4>
          </div>
          {equityMilestones.find(m => m.years === 10) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Your equity</span>
                <span className="font-mono-data font-700 text-green-800">
                  {formatCurrency(equityMilestones.find(m => m.years === 10)!.equity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Home value</span>
                <span className="font-mono-data font-700 text-green-800">
                  {formatCurrency(equityMilestones.find(m => m.years === 10)!.homeValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Equity %</span>
                <span className="font-mono-data font-700 text-green-800">
                  {formatPercent(equityMilestones.find(m => m.years === 10)!.equityPct, 1)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Home size={16} className="text-red-700" />
            <h4 className="font-display text-sm font-700 text-red-800">As a Renter at 10 Years</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Your equity</span>
              <span className="font-mono-data font-700 text-red-800">$0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Cumulative rent paid</span>
              <span className="font-mono-data font-700 text-red-800">
                {formatCurrency(
                  Array.from({ length: 120 }, (_, i) => {
                    const year = Math.floor(i / 12);
                    return inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, year);
                  }).reduce((a, b) => a + b, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Ownership of property</span>
              <span className="font-mono-data font-700 text-red-800">0%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
