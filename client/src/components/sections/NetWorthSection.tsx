/**
 * Section 04 — Net Worth Comparison
 * Precision Ledger Design System
 * Side-by-side net worth for renter vs. owner at 1, 5, 10, 30 years.
 * Accounts for rent inflation, fixed mortgage, home appreciation, and investment returns.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts';
import { TrendingUp, Home, Info, Star } from 'lucide-react';

function NetWorthCard({
  years,
  ownerNetWorth,
  renterNetWorth,
  cumulativeRentPaid,
  ownerEquity,
}: {
  years: number;
  ownerNetWorth: number;
  renterNetWorth: number;
  cumulativeRentPaid: number;
  ownerEquity: number;
}) {
  const ownerWins = ownerNetWorth > renterNetWorth;
  const diff = Math.abs(ownerNetWorth - renterNetWorth);

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 navy-bg rounded flex items-center justify-center">
            <span className="text-white font-mono-data text-xs font-700">
              {years === 30 ? '30' : `${years}Y`}
            </span>
          </div>
          <span className="font-display text-sm font-600 text-gray-800">
            {years === 1 ? '1 Year' : `${years} Years`}
          </span>
        </div>
        {ownerWins ? (
          <span className="winner-badge">Owner wins</span>
        ) : (
          <span className="winner-badge bg-amber-50 text-amber-700 border-amber-200">Renter wins</span>
        )}
      </div>

      <div className="space-y-3">
        <div className={`p-3 rounded-lg ${ownerWins ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Home size={12} className={ownerWins ? 'text-green-700' : 'text-gray-500'} />
            <span className={`text-xs font-medium ${ownerWins ? 'text-green-700' : 'text-gray-600'}`}>Owner Net Worth</span>
          </div>
          <p className={`font-mono-data text-lg font-700 ${ownerWins ? 'text-green-800' : 'text-gray-700'}`}>
            {formatCurrencyCompact(ownerNetWorth)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Equity: {formatCurrencyCompact(ownerEquity)}</p>
        </div>

        <div className={`p-3 rounded-lg ${!ownerWins ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className={!ownerWins ? 'text-amber-700' : 'text-gray-500'} />
            <span className={`text-xs font-medium ${!ownerWins ? 'text-amber-700' : 'text-gray-600'}`}>Renter Net Worth</span>
          </div>
          <p className={`font-mono-data text-lg font-700 ${!ownerWins ? 'text-amber-800' : 'text-gray-700'}`}>
            {formatCurrencyCompact(renterNetWorth)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Rent paid: {formatCurrencyCompact(cumulativeRentPaid)}</p>
        </div>

        <div className="text-center pt-1">
          <span className={`text-xs font-mono-data font-600 ${ownerWins ? 'text-green-700' : 'text-amber-700'}`}>
            {ownerWins ? '▲' : '▼'} {formatCurrencyCompact(diff)} difference
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NetWorthSection() {
  const { inputs, derived } = useCalculator();
  const { netWorthMilestones } = derived;

  const chartData = netWorthMilestones.map(m => ({
    year: `${m.years}yr`,
    'Owner Net Worth': Math.round(m.ownerNetWorth),
    'Renter Net Worth': Math.round(m.renterNetWorth),
  }));

  // Detailed line chart data (year by year)
  const lineData = derived.amortizationSchedule
    .filter(row => row.month % 12 === 0)
    .map(row => {
      const years = row.year;
      const m = years * 12;
      const ownerEquity = row.equity;
      const ownerNW = ownerEquity - derived.totalCashNeeded;

      // Renter: invested down payment + monthly savings
      const monthlyRate = inputs.investmentReturnRate / 100 / 12;
      const investedDown = derived.totalCashNeeded * Math.pow(1 + monthlyRate, m);
      const monthlySavings = Math.max(0, derived.totalMonthlyOwnership - derived.totalMonthlyRent);
      const savedAccum = monthlySavings > 0
        ? monthlySavings * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate)
        : 0;
      const renterNW = investedDown + savedAccum - derived.totalCashNeeded;

      return {
        year: years,
        'Owner Net Worth': Math.round(ownerNW),
        'Renter Net Worth': Math.round(renterNW),
      };
    });

  return (
    <section id="net-worth" className="py-12">
      <div className="section-divider mb-12" />

      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">04</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 04</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Net Worth Comparison</h2>
          <p className="text-gray-500 text-sm max-w-2xl">
            Who comes out ahead financially? This compares the total net worth of a homeowner versus a renter who invests their down payment and monthly savings instead.
          </p>
        </div>
      </div>

      {/* Assumptions callout */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Assumptions:</strong> Owner's net worth = home equity minus initial cash to close. Renter's net worth = down payment invested at {inputs.investmentReturnRate}% annually, plus any monthly savings (if renting is cheaper) also invested.</p>
            <p>★ Rent increases {inputs.rentInflationRate}% per year. Mortgage payment stays <strong>fixed</strong>. Home appreciates {inputs.appreciationRate}% per year (Denver Metro average).</p>
          </div>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {netWorthMilestones.map(m => (
          <NetWorthCard
            key={m.years}
            years={m.years}
            ownerNetWorth={m.ownerNetWorth}
            renterNetWorth={m.renterNetWorth}
            cumulativeRentPaid={m.cumulativeRentPaid}
            ownerEquity={m.ownerEquity}
          />
        ))}
      </div>

      {/* Bar chart comparison */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">Net Worth at Key Milestones</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="25%">
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
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
                    <p className="font-semibold text-gray-700 mb-1">{label}</p>
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
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Bar dataKey="Owner Net Worth" fill="#166534" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Renter Net Worth" fill="#D97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart — year by year */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-1">Net Worth Trajectory Over Time</h3>
        <p className="text-xs text-gray-400 mb-4">
          * Rent increases {inputs.rentInflationRate}%/yr. Mortgage stays fixed. Home appreciates {inputs.appreciationRate}%/yr.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={1} />
            <Line type="monotone" dataKey="Owner Net Worth" stroke="#166534" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Renter Net Worth" stroke="#D97706" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
