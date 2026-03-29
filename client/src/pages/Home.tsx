/**
 * Home Page — Denver Rent vs. Buy Calculator (Simplified)
 * Design: Clean, scannable, side-by-side comparison.
 * Sliders at top → Big numbers in the middle → Deep-dive accordions at bottom.
 */

import { useState } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatCurrencyCompact, formatPercent } from '@/lib/format';
import { ChevronDown, ChevronUp, House, TrendingUp, Wifi } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, ReferenceLine,
} from 'recharts';

// ─── Slider component ────────────────────────────────────────────────────────
function SliderRow({
  label, value, min, max, step, onChange, format,
  hint, prefix = '', suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}) {
  const display = format ? format(value) : `${prefix}${value.toLocaleString()}${suffix}`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
        <span className="font-mono text-sm font-bold text-gray-900">{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-600 cursor-pointer"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Accordion section ────────────────────────────────────────────────────────
function Accordion({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        {open
          ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'gray' }: { label: string; value: string; sub?: string; color?: 'green' | 'red' | 'blue' | 'gray' }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="font-mono text-xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ payload, label, labelPrefix = '' }: any) {
  if (!payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{labelPrefix}{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { inputs, derived, setInput, rateLoading, rateFetched } = useCalculator();

  const monthlyDiff = derived.totalMonthlyOwnership - derived.totalMonthlyRent;
  const rentingCheaper = monthlyDiff > 0;

  // Amortization chart data (annual)
  const amortoData = derived.amortizationSchedule
    .filter(r => r.month % 12 === 0)
    .map(r => ({
      year: `Yr ${r.year}`,
      'Loan Balance': Math.round(r.balance),
      'Home Value': Math.round(r.homeValue),
      'Your Equity': Math.round(r.equity),
    }));

  // Equity milestones bar chart
  const equityData = derived.equityMilestones.map(m => ({
    name: `${m.years}yr`,
    Equity: Math.round(m.equity),
    'Loan Balance': Math.round(m.loanBalance),
  }));

  // Net worth comparison
  const nwData = derived.netWorthMilestones.map(m => ({
    name: `${m.years}yr`,
    'Owner': Math.round(m.ownerNetWorth),
    'Renter': Math.round(m.renterNetWorth),
  }));

  // Savings race data
  const savingsData = Array.from({ length: 37 }, (_, i) => {
    const month = i * 2;
    const savings = inputs.monthlySavingsAmount * month;
    const homeGain = inputs.homePrice * (Math.pow(1 + inputs.appreciationRate / 100 / 12, month) - 1);
    return { month, 'Your Savings': Math.round(savings), 'Home Price Increase': Math.round(homeGain) };
  });

  const monthlyAppreciation = inputs.homePrice * (inputs.appreciationRate / 100 / 12);
  const leaseBreakCost = inputs.monthlyRent * inputs.leaseBreakMonths;
  const priceIncreaseYear = inputs.homePrice * (inputs.appreciationRate / 100);
  const monthsToRecoup = leaseBreakCost / (priceIncreaseYear / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <House size={14} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Rent vs. Buy</p>
              <p className="text-xs text-gray-400 leading-tight">Denver Metro Calculator</p>
            </div>
          </div>
          {rateFetched && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <Wifi size={11} />
              Live rate: {inputs.interestRate}%
            </div>
          )}
          {rateLoading && (
            <div className="text-xs text-gray-400">Fetching live rate…</div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── SECTION 1: Sliders ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5">Your Numbers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* Left: Purchase */}
            <div className="space-y-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Buying</p>
              <SliderRow label="Home Price" value={inputs.homePrice} min={200000} max={1500000} step={5000}
                onChange={v => setInput('homePrice', v)} format={v => formatCurrency(v)}
                hint="Denver Metro median: ~$565K" />
              <SliderRow label="Down Payment" value={inputs.downPaymentPct} min={3} max={30} step={0.5}
                onChange={v => setInput('downPaymentPct', v)}
                format={v => `${v}% (${formatCurrency(inputs.homePrice * v / 100)})`} />
              <SliderRow label="Interest Rate" value={inputs.interestRate} min={3} max={12} step={0.05}
                onChange={v => setInput('interestRate', v)} suffix="%" />
              <SliderRow label="HOA Monthly" value={inputs.hoaMonthly} min={0} max={800} step={25}
                onChange={v => setInput('hoaMonthly', v)} prefix="$" hint="Denver avg: ~$150/mo" />
              <SliderRow label="Property Tax" value={inputs.propertyTaxRate} min={0.1} max={3} step={0.05}
                onChange={v => setInput('propertyTaxRate', v)} suffix="% / yr"
                hint="Colorado effective rate: ~0.50%" />
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buying — Advanced</p>
                <SliderRow label="Loan Term" value={inputs.loanTermYears} min={10} max={30} step={5}
                  onChange={v => setInput('loanTermYears', v)} suffix=" years" />
                <SliderRow label="Extra Monthly Payment" value={inputs.extraMonthlyPayment} min={0} max={2000} step={50}
                  onChange={v => setInput('extraMonthlyPayment', v)} prefix="$"
                  hint="Pay extra to reduce interest & pay off early" />
              </div>
            </div>

            {/* Right: Renting */}
            <div className="space-y-5">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Renting</p>
              <SliderRow label="Monthly Rent" value={inputs.monthlyRent} min={500} max={6000} step={50}
                onChange={v => setInput('monthlyRent', v)} prefix="$" hint="Denver Metro median: ~$2,200/mo" />
              <SliderRow label="Rent Inflation" value={inputs.rentInflationRate} min={0} max={8} step={0.25}
                onChange={v => setInput('rentInflationRate', v)} suffix="% / yr"
                hint="Historical Denver avg: ~3%/yr" />

              <div className="border-t border-gray-100 pt-4 mt-2 space-y-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Renting — Advanced</p>
                <SliderRow label="Lease Break Fee" value={inputs.leaseBreakMonths} min={0} max={6} step={1}
                  onChange={v => setInput('leaseBreakMonths', v)} suffix=" months rent" />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Side-by-side comparison ─────────────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-3">Monthly Cost Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Renting */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">Renting</p>
              <p className="font-mono text-3xl font-black text-orange-800 mb-4">
                {formatCurrency(derived.totalMonthlyRent)}
                <span className="text-base font-normal text-orange-500">/mo</span>
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-orange-700">
                  <span>Rent</span>
                  <span className="font-mono font-semibold">{formatCurrency(inputs.monthlyRent)}</span>
                </div>
                <div className="flex justify-between text-orange-600 opacity-70">
                  <span>Renter's Insurance</span>
                  <span className="font-mono">{formatCurrency(inputs.renterInsurance)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200">
                <p className="text-xs text-orange-600">
                  ★ Rent rises ~{inputs.rentInflationRate}%/yr. In 5 years: <strong>{formatCurrency(inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, 5))}/mo</strong>
                </p>
              </div>
            </div>

            {/* Buying */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Buying</p>
              <p className="font-mono text-3xl font-black text-blue-800 mb-4">
                {formatCurrency(derived.totalMonthlyOwnership)}
                <span className="text-base font-normal text-blue-500">/mo</span>
              </p>
              <div className="space-y-1.5 text-sm">
                {[
                  ['Principal & Interest', derived.monthlyMortgagePI],
                  ['Property Tax', derived.monthlyPropertyTax],
                  ['Insurance', derived.monthlyInsurance],
                  ['Maintenance', derived.monthlyMaintenance],
                  ['HOA', inputs.hoaMonthly],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-blue-700">
                    <span>{label}</span>
                    <span className="font-mono font-semibold">{formatCurrency(val as number)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  ★ Mortgage stays <strong>fixed</strong> for {inputs.loanTermYears} years.
                </p>
              </div>
            </div>

            {/* Difference */}
            <div className={`rounded-2xl p-5 border-2 ${rentingCheaper ? 'bg-orange-100 border-orange-300' : 'bg-green-50 border-green-300'}`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-600">Monthly Difference</p>
              <p className={`font-mono text-3xl font-black mb-1 ${rentingCheaper ? 'text-orange-800' : 'text-green-800'}`}>
                {rentingCheaper ? '+' : '-'}{formatCurrency(Math.abs(monthlyDiff))}
              </p>
              <p className={`text-sm font-semibold mb-4 ${rentingCheaper ? 'text-orange-700' : 'text-green-700'}`}>
                {rentingCheaper ? 'Renting costs less monthly' : 'Buying costs less monthly'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Cash to close</span>
                  <span className="font-mono font-bold">{formatCurrency(derived.totalCashNeeded)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Down payment</span>
                  <span className="font-mono">{formatCurrency(derived.downPaymentAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Closing costs (~{inputs.closingCostPct}%)</span>
                  <span className="font-mono">{formatCurrency(derived.closingCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Equity Snapshot ──────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-1">Your Equity Over Time</h2>
          <p className="text-sm text-gray-500 mb-4">Equity = your down payment + principal paid down + home appreciation. Renting builds <strong className="text-red-600">$0 equity</strong> — your net worth from housing stays flat.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {derived.equityMilestones.map(m => (
              <div key={m.years} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{m.years === 1 ? '1 Year' : `${m.years} Years`}</p>
                <p className="font-mono text-xl font-black text-green-700 mb-3">{formatCurrencyCompact(m.equity)}</p>
                {/* Breakdown stacked bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 flex-shrink-0" />
                    <span className="text-gray-500 flex-1">Down payment</span>
                    <span className="font-mono font-semibold text-blue-700">{formatCurrencyCompact(m.downPaymentAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-green-500 flex-shrink-0" />
                    <span className="text-gray-500 flex-1">Loan paid down</span>
                    <span className="font-mono font-semibold text-green-700">{formatCurrencyCompact(m.principalPaid)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 flex-shrink-0" />
                    <span className="text-gray-500 flex-1">Appreciation</span>
                    <span className="font-mono font-semibold text-emerald-700">{formatCurrencyCompact(m.appreciationGain)}</span>
                  </div>
                </div>
                {/* Visual equity bar */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(m.equityPct, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatPercent(m.equityPct)} of home value</p>
              </div>
            ))}
          </div>
          {inputs.extraMonthlyPayment > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <strong>Extra payment impact:</strong> Paying {formatCurrency(inputs.extraMonthlyPayment)}/mo extra saves{' '}
              <strong>{formatCurrency(derived.interestSavings)}</strong> in interest and pays off the loan in{' '}
              <strong>{derived.payoffDateWithExtra}</strong> instead of {derived.payoffDateStandard}.
            </div>
          )}
        </div>

        {/* ── SECTION 4: Lease Break Insight ─────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp size={15} className="text-blue-700" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-base mb-1">Should You Break Your Lease?</h2>
              <p className="text-sm text-gray-500 mb-4">
                Breaking your lease costs <strong className="text-gray-800">{formatCurrency(leaseBreakCost)}</strong> ({inputs.leaseBreakMonths} months rent).
                Denver homes appreciate ~<strong className="text-gray-800">{formatCurrency(monthlyAppreciation)}/month</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Lease Break Fee" value={formatCurrency(leaseBreakCost)} color="red" />
                <StatCard label="Home Gain in 12 Months" value={formatCurrency(priceIncreaseYear)} color="green"
                  sub={`${inputs.appreciationRate}% appreciation`} />
                <StatCard
                  label="Break Even In"
                  value={`${monthsToRecoup.toFixed(1)} months`}
                  color={monthsToRecoup <= 6 ? 'green' : 'blue'}
                  sub="Appreciation covers the fee"
                />
              </div>
              <p className={`mt-4 text-sm font-semibold rounded-lg px-4 py-2.5 ${leaseBreakCost < priceIncreaseYear ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {leaseBreakCost < priceIncreaseYear
                  ? `✓ Breaking your lease is likely worth it — the home you want gets ${formatCurrency(priceIncreaseYear - leaseBreakCost)} more expensive in one year than your break fee.`
                  : `⚠ In this scenario, the appreciation (${formatCurrency(priceIncreaseYear)}) is less than your break fee (${formatCurrency(leaseBreakCost)}). Consider negotiating.`}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Savings Race ─────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-base mb-1">Can You Save Faster Than Prices Rise?</h2>
          <p className="text-sm text-gray-500 mb-4">
            You save <strong className="text-gray-800">{formatCurrency(inputs.monthlySavingsAmount)}/mo</strong> toward your down payment.
            The home appreciates <strong className="text-gray-800">{formatCurrency(monthlyAppreciation)}/mo</strong>.
          </p>
          <div className="mb-4">
            <SliderRow label="Monthly Savings Toward Down Payment" value={inputs.monthlySavingsAmount} min={0} max={5000} step={100}
              onChange={v => setInput('monthlySavingsAmount', v)} prefix="$" />
          </div>
          {inputs.monthlySavingsAmount < monthlyAppreciation ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              <strong>You're falling behind.</strong> For every dollar you save, the home gets{' '}
              <strong>{(monthlyAppreciation / Math.max(inputs.monthlySavingsAmount, 1)).toFixed(1)}× more expensive</strong>.
              You need to save at least <strong>{formatCurrency(monthlyAppreciation)}/mo</strong> just to break even.
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <strong>You're gaining ground!</strong> You're saving {formatCurrency(inputs.monthlySavingsAmount - monthlyAppreciation)}/mo faster than prices rise.
            </div>
          )}
        </div>

        {/* ── DEEP DIVE ACCORDIONS ────────────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-3">Dig Deeper</h2>
          <div className="space-y-3">

            {/* Amortization */}
            <Accordion title="Amortization Schedule" subtitle="See how every payment splits between principal and interest over time">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Monthly P&I" value={formatCurrency(derived.monthlyMortgagePI)} color="blue" />
                  <StatCard label="Loan Amount" value={formatCurrencyCompact(derived.loanAmount)} color="blue" />
                  <StatCard label="Total Interest" value={formatCurrencyCompact(derived.totalInterestStandard)} color="red" sub="Over full term" />
                  {inputs.extraMonthlyPayment > 0 && (
                    <StatCard label="Interest Saved" value={formatCurrencyCompact(derived.interestSavings)} color="green" sub={`Paid off: ${derived.payoffDateWithExtra}`} />
                  )}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={amortoData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Home Value" stroke="#1D4ED8" strokeWidth={2} fill="url(#g1)" />
                    <Area type="monotone" dataKey="Your Equity" stroke="#16a34a" strokeWidth={2} fill="url(#g2)" />
                    <Area type="monotone" dataKey="Loan Balance" stroke="#dc2626" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Condensed table — first 10 years */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Year', 'Principal Paid', 'Interest Paid', 'Balance', 'Equity'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-gray-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {derived.amortizationSchedule
                        .filter(r => r.month % 12 === 0)
                        .slice(0, 30)
                        .map(r => (
                          <tr key={r.year} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-1.5 pr-4 font-mono font-semibold text-gray-700">Yr {r.year}</td>
                            <td className="py-1.5 pr-4 font-mono text-green-700">{formatCurrency(r.principal)}</td>
                            <td className="py-1.5 pr-4 font-mono text-red-600">{formatCurrency(r.interest)}</td>
                            <td className="py-1.5 pr-4 font-mono text-gray-600">{formatCurrencyCompact(r.balance)}</td>
                            <td className="py-1.5 font-mono font-bold text-blue-700">{formatCurrencyCompact(r.equity)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Accordion>

            {/* Net Worth */}
            <Accordion title="Net Worth Comparison" subtitle="Owner vs. renter wealth at 1, 5, 10, and 30 years — assuming renter invests the down payment">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <span className="inline-block mr-1">ℹ</span>
                  Owner net worth = home equity (appreciation + loan paydown + down payment) minus cash to close. Renter net worth = down payment invested at {inputs.investmentReturnRate}% annually, plus monthly savings from cheaper rent.
                  Rent rises {inputs.rentInflationRate}%/yr. Mortgage stays fixed. Home appreciates {inputs.appreciationRate}%/yr.
                  <strong className="block mt-1 text-orange-700">★ Renter's housing net worth = $0 at every milestone. Any renter "net worth" shown comes only from investing — not from housing.</strong>
                </div>
                <div className="mb-1">
                  <SliderRow label="Investment Return Rate (Renter)" value={inputs.investmentReturnRate} min={1} max={15} step={0.5}
                    onChange={v => setInput('investmentReturnRate', v)} suffix="% / yr"
                    hint="S&P 500 historical avg: ~7–10% real" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {derived.netWorthMilestones.map(m => (
                    <div key={m.years} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-2">{m.years === 30 ? '30 Years' : `${m.years} Year${m.years > 1 ? 's' : ''}`}</p>
                      <div className="space-y-1">
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Owner</p>
                          <p className="font-mono text-sm font-bold text-blue-800">{formatCurrencyCompact(m.ownerNetWorth)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-orange-500 font-medium">Renter</p>
                          <p className="font-mono text-sm font-bold text-orange-700">{formatCurrencyCompact(m.renterNetWorth)}</p>
                        </div>
                        <p className={`text-xs font-semibold ${m.ownerNetWorth > m.renterNetWorth ? 'text-green-600' : 'text-amber-600'}`}>
                          {m.ownerNetWorth > m.renterNetWorth ? '▲ Owner ahead' : '▲ Renter ahead'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={nwData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine y={0} stroke="#e5e7eb" />
                    <Bar dataKey="Owner" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Renter" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion>



            {/* True Cost of Renting */}
            <Accordion title="True Cost of Renting" subtitle="How much total rent will you pay over 1, 5, 10, and 30 years — vs. the equity you'd have from owning?">
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 5, 10, 30].map(years => {
                    let cumRent = 0;
                    let r = inputs.monthlyRent;
                    for (let m = 0; m < years * 12; m++) {
                      if (m > 0 && m % 12 === 0) r *= (1 + inputs.rentInflationRate / 100);
                      cumRent += r;
                    }
                    // Equity from owning at same milestone
                    const milestone = derived.equityMilestones.find(e => e.years === years);
                    const ownerEquity = milestone ? milestone.equity : null;
                    return (
                      <div key={years} className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <p className="text-xs text-red-500 mb-1 font-semibold">{years === 1 ? '1 Year' : `${years} Years`}</p>
                        <p className="font-mono text-base font-bold text-red-800">{formatCurrencyCompact(cumRent)}</p>
                        <p className="text-xs text-red-400 mt-0.5">$0 equity</p>
                        {ownerEquity !== null && (
                          <p className="font-mono text-base font-bold text-green-700 mt-2">{formatCurrencyCompact(ownerEquity)}</p>
                        )}
                        {ownerEquity !== null && (
                          <p className="text-xs text-green-600 mt-0.5">equity if owned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  ★ Assumes rent increases {inputs.rentInflationRate}% per year. All rent payments build zero equity.
                  After 30 years as a renter, your monthly rent would be{' '}
                  <strong>{formatCurrency(inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, 30))}/mo</strong>.
                </p>
              </div>
            </Accordion>

            <Accordion title="Mortgage Interest Tax Benefit" subtitle="Rough estimate of your potential deduction in year one">
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  ⚠ Educational estimate only. Consult a CPA before making tax decisions.
                </div>
                {(() => {
                  const firstYearInterest = derived.amortizationSchedule.filter(r => r.year === 1).reduce((s, r) => s + r.interest, 0);
                  const annualTax = inputs.homePrice * inputs.propertyTaxRate / 100;
                  const salt = Math.min(annualTax, 10000);
                  const total = firstYearInterest + salt;
                  const stdSingle = 15000;
                  const stdMarried = 30000;
                  const benefitSingle = Math.max(0, total - stdSingle);
                  const benefitMarried = Math.max(0, total - stdMarried);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600">Year 1 Deductions</p>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Mortgage interest</span><span className="font-mono font-bold">{formatCurrency(firstYearInterest)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Property tax (SALT cap)</span><span className="font-mono font-bold">{formatCurrency(salt)}</span></div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2"><span>Total itemized</span><span className="font-mono">{formatCurrency(total)}</span></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600">Estimated Tax Savings (22%)</p>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Single filer</span><span className="font-mono font-bold text-green-700">{formatCurrency(benefitSingle * 0.22)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Married filing jointly</span><span className="font-mono font-bold text-green-700">{formatCurrency(benefitMarried * 0.22)}</span></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Accordion>

            {/* Savings Race Chart — last accordion */}
            <Accordion title="The Savings Race (Chart)" subtitle="Can you save faster than home prices rise? See the gap over 6 years">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Blue = what you've saved. Red = how much more expensive the home has become.
                  You need to save at least <strong>{formatCurrency(monthlyAppreciation)}/mo</strong> just to keep pace.
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={savingsData}>
                    <defs>
                      <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v % 12 === 0 ? `Yr ${v/12}` : ''} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={({ payload, label }) => {
                      if (!payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow p-2 text-xs">
                          <p className="font-semibold mb-1">Month {label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {formatCurrency(p.value)}</p>
                          ))}
                        </div>
                      );
                    }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Your Savings" stroke="#1D4ED8" strokeWidth={2} fill="url(#sg1)" />
                    <Area type="monotone" dataKey="Home Price Increase" stroke="#dc2626" strokeWidth={2} fill="url(#sg2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Accordion>

          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200">
          <p>For educational purposes only. Not financial advice. Consult a licensed mortgage professional and financial advisor before making decisions.</p>
          <p className="mt-1">Denver Metro defaults based on Freddie Mac, Redfin, and Colorado CAR data as of early 2026.</p>
        </footer>

      </main>
    </div>
  );
}
