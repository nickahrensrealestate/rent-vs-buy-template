/**
 * Home Page — Denver Rent vs. Buy Calculator (lead-max embed copy)
 * Core sliders → equity / net-worth results → CTA → monthly gap → advanced expanders.
 */

import { useCallback, useState } from 'react';
import { useCalculator, type CalculatorInputs } from '@/contexts/CalculatorContext';
import { useParentBridge } from '@/hooks/useParentBridge';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT } from '@/lib/compound';
import HeroPromise, { LeadCtaBlock, StickyCtaBar } from '@/components/lead/LeadCtas';
import { ChevronDown, ChevronUp, House, Wifi } from 'lucide-react';
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
function Accordion({ title, subtitle, children, defaultOpen = false }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
  const { inputs, derived, setInput, resetInputs, rateLoading, rateFetched } = useCalculator();
  const { focusParentForm } = useParentBridge();
  const [hasTouchedSlider, setHasTouchedSlider] = useState(false);

  const update = useCallback(<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setHasTouchedSlider(true);
    setInput(key, value);
  }, [setInput]);

  const onBreakdown = () => focusParentForm('breakdown');
  const onWatching = () => focusParentForm('watching');

  const appreciationOptions = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];

  const savingsSteps = [
    ...Array.from({ length: 51 }, (_, i) => i * 100),
    ...Array.from({ length: 20 }, (_, i) => 5500 + i * 500),
  ];
  const savingsIndex = savingsSteps.reduce((best, val, idx) =>
    Math.abs(val - inputs.monthlySavingsAmount) < Math.abs(savingsSteps[best] - inputs.monthlySavingsAmount) ? idx : best, 0
  );

  const monthlyDiff = derived.totalMonthlyOwnership - derived.totalMonthlyRent;
  const buyCostsMoreMonthly = monthlyDiff > 0;
  const rentCostsMoreMonthly = monthlyDiff < 0;

  const amortoData = derived.amortizationSchedule
    .filter(r => r.month % 12 === 0)
    .map(r => ({
      year: `Yr ${r.year}`,
      'Loan Balance': Math.round(r.balance),
      'Home Value': Math.round(r.homeValue),
      'Your Equity': Math.round(r.equity),
    }));

  const nwData = derived.netWorthMilestones.map(m => ({
    name: `${m.years}yr`,
    'Owner': Math.round(m.ownerNetWorth),
    'Renter invested gap': Math.round(m.renterNetWorth),
  }));

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
    <div className={`min-h-screen bg-gray-50 ${hasTouchedSlider ? 'pb-20' : ''}`}>
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

      <HeroPromise />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── CORE SLIDERS ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Your numbers</h2>
              <p className="text-xs text-gray-500 mt-0.5">A few taps — then a personal breakdown below.</p>
            </div>
            <button
              onClick={resetInputs}
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            <div className="space-y-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Buying</p>
              <SliderRow label="Home Price" value={inputs.homePrice} min={200000} max={1500000} step={5000}
                onChange={v => update('homePrice', v)} format={v => formatCurrency(v)}
                hint="Denver Metro median: ~$565K" />
              <SliderRow label="Down Payment" value={inputs.downPaymentPct} min={3} max={30} step={0.5}
                onChange={v => update('downPaymentPct', v)}
                format={v => `${v}% (${formatCurrency(inputs.homePrice * v / 100)})`} />
              <SliderRow label="Interest Rate" value={inputs.interestRate} min={3} max={12} step={0.05}
                onChange={v => update('interestRate', v)} suffix="%" />
              <SliderRow label="HOA Monthly" value={inputs.hoaMonthly} min={0} max={800} step={25}
                onChange={v => update('hoaMonthly', v)} prefix="$" hint="Denver avg: ~$150/mo" />
              <SliderRow label="Property Tax" value={inputs.propertyTaxRate} min={0.1} max={3} step={0.05}
                onChange={v => update('propertyTaxRate', v)} suffix="% / yr"
                hint="Denver Metro avg: ~1.0% effective rate" />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Home Appreciation</label>
                  <span className="font-mono text-sm font-bold text-gray-900">{inputs.appreciationRate}% / yr</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {appreciationOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => update('appreciationRate', opt)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        inputs.appreciationRate === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {opt}%
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Denver Metro avg: ~4.25%/yr historically. Default set to 3.5% (conservative estimate).</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Renting</p>
              <SliderRow label="Monthly Rent" value={inputs.monthlyRent} min={500} max={6000} step={50}
                onChange={v => update('monthlyRent', v)} prefix="$" hint="Denver Metro median: ~$2,200/mo" />
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                After you set these, we lead with <strong>owner equity</strong> — what you&apos;d own over time —
                then the monthly cash difference (which includes tax, HOA, maintenance, and insurance on the buy side).
              </div>
            </div>
          </div>
        </div>

        {/* ── HERO RESULT: OWNER EQUITY ───────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-lg mb-1">If you buy: estimated owner equity</h2>
          <p className="text-sm text-gray-500 mb-4">
            This is the headline — wealth in the home at 1, 3, 5, and 10 years (down payment + loan paydown + appreciation).
            Figures are estimates for illustration, not a prediction.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {derived.equityMilestones.map(m => (
              <div key={m.years} className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{m.years === 1 ? '1 Year' : `${m.years} Years`}</p>
                <p className="font-mono text-xl font-black text-green-700 mb-3">{formatCurrencyCompact(m.equity)}</p>
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
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(m.equityPct, 100)}%` }} />
                </div>
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

        {/* ── RENTER INVEST-THE-GAP (replaces renter = $0) ─────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-1">If you rent: invested monthly gap (illustration)</h2>
          <p className="text-sm text-gray-500 mb-3">
            Housing equity from renting is still $0. As a comparison, this path invests the monthly payment
            difference (<strong>buy − rent</strong>, only when buying costs more) into an S&amp;P 500-like
            portfolio at <strong>{ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT}% annual</strong> return, compounded monthly.
            Estimate only — not a forecast or investment advice.
          </p>
          {derived.monthlyInvestGap > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {derived.renterInvestedMilestones.map(m => (
                <div key={m.years} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-2 font-semibold">{m.years === 1 ? '1 Year' : `${m.years} Years`}</p>
                  <p className="font-mono text-xl font-black text-gray-800">{formatCurrencyCompact(m.investedBalance)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(m.monthlyContribution)}/mo invested
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
              In this scenario <strong>renting costs more monthly</strong>, so there is no extra cash left over
              to invest. Illustrated invested gap: <strong>$0</strong>.
            </div>
          )}
        </div>

        {/* ── PRIMARY CTA (after core results) ────────────────────────────── */}
        <LeadCtaBlock onBreakdown={onBreakdown} onWatching={onWatching} />

        {/* ── MONTHLY GAP (second, not the hero takeaway) ─────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-1">Monthly cash comparison</h2>
          <p className="text-sm text-gray-500 mb-4">
            Second look — not the main takeaway. The buy total includes principal &amp; interest,
            property tax, HOA, maintenance, and insurance, not just the mortgage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span>Renter&apos;s Insurance</span>
                  <span className="font-mono">{formatCurrency(inputs.renterInsurance)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200">
                <p className="text-xs text-orange-600">
                  ★ Rent rises ~{inputs.rentInflationRate}%/yr. In 5 years: <strong>{formatCurrency(inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, 5))}/mo</strong>
                </p>
              </div>
            </div>

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

            <div className="rounded-2xl p-5 border bg-white border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-600">Monthly gap</p>
              <p className="font-mono text-3xl font-black mb-1 text-gray-900">
                {formatCurrency(Math.abs(monthlyDiff))}
              </p>
              <p className="text-sm font-medium mb-4 text-gray-700">
                {buyCostsMoreMonthly
                  ? 'Buying costs more each month (this gap is what the invest-the-difference illustration uses)'
                  : rentCostsMoreMonthly
                    ? 'Renting costs more monthly in this scenario'
                    : 'Monthly costs are about even'}
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

        {/* ── ADVANCED EXPANDERS ──────────────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-3">More detail (optional)</h2>
          <div className="space-y-3">

            <Accordion title="More assumptions" subtitle="Loan term, extra payments, rent inflation, lease-break fee, savings race">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                <div className="space-y-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buying — Advanced</p>
                  <SliderRow label="Loan Term" value={inputs.loanTermYears} min={10} max={30} step={5}
                    onChange={v => update('loanTermYears', v)} suffix=" years" />
                  <SliderRow label="Extra Monthly Payment" value={inputs.extraMonthlyPayment} min={0} max={2000} step={50}
                    onChange={v => update('extraMonthlyPayment', v)} prefix="$"
                    hint="Pay extra to reduce interest & pay off early" />
                </div>
                <div className="space-y-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Renting — Advanced</p>
                  <SliderRow label="Rent Inflation" value={inputs.rentInflationRate} min={0} max={8} step={0.25}
                    onChange={v => update('rentInflationRate', v)} suffix="% / yr"
                    hint="Historical Denver avg: ~3%/yr" />
                  <SliderRow label="Lease Break Fee" value={inputs.leaseBreakMonths} min={0} max={6} step={1}
                    onChange={v => update('leaseBreakMonths', v)} suffix=" months rent" />
                </div>
              </div>
            </Accordion>

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

            <Accordion title="Net Worth Comparison" subtitle="Owner housing equity vs. renter invested-gap illustration at 1, 5, 10, and 30 years">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <strong>Owner net worth</strong> = home equity (down payment + principal paid down + appreciation) minus closing costs.
                  Home appreciates {inputs.appreciationRate}%/yr. Mortgage payment stays fixed.
                  <span className="block mt-1">
                    <strong>Renter illustration</strong> = the monthly buy−rent gap invested at {derived.illustrativeInvestReturnPct}%/yr
                    (S&amp;P 500-like assumption, compounded monthly). Housing equity from renting remains $0.
                    This is an estimate, not advice. If rent already costs more monthly, the invested gap is $0.
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {derived.netWorthMilestones.map(m => (
                    <div key={m.years} className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 text-center">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">{m.years === 30 ? '30 Years' : `${m.years} Year${m.years > 1 ? 's' : ''}`}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Owner</p>
                          <p className="font-mono text-lg font-black text-blue-800">{formatCurrencyCompact(m.ownerNetWorth)}</p>
                          <p className="text-xs text-blue-500">housing net worth</p>
                        </div>
                        <div className="border-t border-blue-200 pt-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Renter (invested gap)</p>
                          <p className="font-mono text-lg font-black text-gray-800">{formatCurrencyCompact(m.renterNetWorth)}</p>
                          <p className="text-xs text-gray-400">illustration at {derived.illustrativeInvestReturnPct}%</p>
                        </div>
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
                    <Bar dataKey="Renter invested gap" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion>

            <Accordion title="True Cost of Renting" subtitle="Total rent paid over 1, 5, 10, and 30 years vs. equity from owning">
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 5, 10, 30].map(years => {
                    let cumRent = 0;
                    let r = inputs.monthlyRent;
                    for (let m = 0; m < years * 12; m++) {
                      if (m > 0 && m % 12 === 0) r *= (1 + inputs.rentInflationRate / 100);
                      cumRent += r;
                    }
                    const milestone = derived.equityMilestones.find(e => e.years === years);
                    const ownerEquity = milestone ? milestone.equity : null;
                    const invested = derived.netWorthMilestones.find(e => e.years === years)?.renterNetWorth;
                    return (
                      <div key={years} className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <p className="text-xs text-red-500 mb-1 font-semibold">{years === 1 ? '1 Year' : `${years} Years`}</p>
                        <p className="font-mono text-base font-bold text-red-800">{formatCurrencyCompact(cumRent)}</p>
                        <p className="text-xs text-red-400 mt-0.5">$0 housing equity</p>
                        {invested != null && (
                          <p className="text-xs text-gray-500 mt-1">Invested-gap illustration: {formatCurrencyCompact(invested)}</p>
                        )}
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
                  ★ Assumes rent increases {inputs.rentInflationRate}% per year. Rent payments do not build housing equity.
                  The invested-gap figures above are an illustration at {derived.illustrativeInvestReturnPct}%/yr, not advice.
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

            <Accordion title="Can You Save Faster Than Prices Rise?" subtitle="Monthly savings toward a down payment vs. home price growth">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Note: If your monthly savings equal the monthly appreciation, the net effect on your purchasing position is neutral — your down payment grows, but so does the price of the home by roughly the same amount.
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Savings Toward Down Payment</label>
                    <span className="font-mono text-sm font-bold text-gray-900">{formatCurrency(inputs.monthlySavingsAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={savingsSteps.length - 1}
                    step={1}
                    value={savingsIndex}
                    onChange={e => update('monthlySavingsAmount', savingsSteps[parseInt(e.target.value)])}
                    className="w-full h-1.5 rounded-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>$0</span>
                    <span>$5,000</span>
                    <span>$15,000</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard label="You Save / Month" value={formatCurrency(inputs.monthlySavingsAmount)} color="blue" />
                  <StatCard label="Home Gains / Month" value={formatCurrency(monthlyAppreciation)} color={inputs.monthlySavingsAmount >= monthlyAppreciation ? 'green' : 'red'}
                    sub={`${inputs.appreciationRate}% / yr appreciation`} />
                  <StatCard
                    label={inputs.monthlySavingsAmount >= monthlyAppreciation ? 'Getting Closer' : 'Falling Behind'}
                    value={formatCurrency(Math.abs(inputs.monthlySavingsAmount - monthlyAppreciation)) + '/mo'}
                    color={inputs.monthlySavingsAmount >= monthlyAppreciation ? 'green' : 'red'}
                    sub={inputs.monthlySavingsAmount >= monthlyAppreciation ? 'ahead of appreciation' : 'behind appreciation'}
                  />
                </div>
                {inputs.monthlySavingsAmount === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                    Set a monthly savings amount above to see how it compares to home price growth.
                  </div>
                ) : inputs.monthlySavingsAmount < monthlyAppreciation ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                    At this savings rate, your down payment grows by <strong>{formatCurrency(inputs.monthlySavingsAmount)}/mo</strong>, while the home price increases by approximately <strong>{formatCurrency(monthlyAppreciation)}/mo</strong>.
                    The net change in your purchasing position is <strong>−{formatCurrency(monthlyAppreciation - inputs.monthlySavingsAmount)}/mo</strong>.
                    To keep pace with appreciation, savings of at least <strong>{formatCurrency(monthlyAppreciation)}/mo</strong> would be needed.
                  </div>
                ) : inputs.monthlySavingsAmount === monthlyAppreciation ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                    Your savings rate matches the monthly appreciation. Your down payment balance increases, but so does the home price by roughly the same amount — your net purchasing position stays approximately the same.
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                    Your savings exceed the monthly appreciation by <strong>{formatCurrency(inputs.monthlySavingsAmount - monthlyAppreciation)}/mo</strong>.
                    At this rate, your purchasing position is improving over time.
                  </div>
                )}
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

            <Accordion title="Lease Break Cost vs. Home Price Change" subtitle="Estimated lease-break fee compared with projected 12-month price change">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  This compares the estimated cost of breaking a lease early against the projected change in home price over the same period, based on the appreciation rate entered above.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard label="Estimated Lease Break Fee" value={formatCurrency(leaseBreakCost)} color="blue" sub={`${inputs.leaseBreakMonths} months rent`} />
                  <StatCard label="Projected Home Price Increase (12 mo)" value={formatCurrency(priceIncreaseYear)} color="blue"
                    sub={`Based on ${inputs.appreciationRate}% annual appreciation`} />
                  <StatCard
                    label="Months for Appreciation to Offset Fee"
                    value={`${monthsToRecoup.toFixed(1)} months`}
                    color="blue"
                    sub="At the current appreciation rate"
                  />
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  {leaseBreakCost < priceIncreaseYear
                    ? `At these inputs, the projected 12-month home price increase (${formatCurrency(priceIncreaseYear)}) exceeds the estimated lease break fee (${formatCurrency(leaseBreakCost)}) by ${formatCurrency(priceIncreaseYear - leaseBreakCost)}. Individual lease terms, market conditions, and personal circumstances will vary.`
                    : `At these inputs, the estimated lease break fee (${formatCurrency(leaseBreakCost)}) exceeds the projected 12-month home price increase (${formatCurrency(priceIncreaseYear)}) by ${formatCurrency(leaseBreakCost - priceIncreaseYear)}. Individual lease terms, market conditions, and personal circumstances will vary.`}
                </p>
              </div>
            </Accordion>

          </div>
        </div>

        <footer className="border-t border-gray-200 pt-6 pb-8 text-xs text-gray-400 space-y-3">
          <p className="font-semibold text-gray-500 text-sm">Important Disclosures</p>
          <p>
            This calculator is provided for <strong>educational and illustrative purposes only</strong>. All figures are estimates based on the inputs you provide and general market assumptions. Results do not constitute financial, legal, tax, or real estate advice, and should not be relied upon as the basis for any financial decision.
          </p>
          <p>
            The renter “invested monthly gap” path assumes leftover cash (buy cost minus rent, when buy is higher) is contributed monthly to a portfolio that compounds at {ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT}% per year. That rate is an S&amp;P 500-like illustration only — not a historical claim for any specific period, not a guarantee, and not investment advice. Actual returns vary and can be negative.
          </p>
          <p>
            Home values, interest rates, rental prices, and market conditions change frequently and vary significantly by neighborhood, property type, and individual circumstances. The appreciation rate, property tax rate, HOA fees, insurance costs, and other assumptions used here are generalizations and may not reflect your specific situation.
          </p>
          <p>
            <strong>Before making any decision to rent, purchase, or break a lease</strong>, you are strongly encouraged to consult with a licensed real estate professional, a certified financial planner (CFP), a licensed mortgage loan originator (MLO), a qualified tax advisor, and/or a licensed attorney as appropriate to your situation.
          </p>
          <p>
            Lease break fees, penalties, and terms vary by contract. Always review your lease agreement and consult with a legal professional before taking action.
          </p>
          <p className="text-gray-300">
            Default values are based on Denver Metro area data from Freddie Mac, Redfin, and Colorado Association of Realtors as of early 2026. Interest rate is fetched from the FRED (Federal Reserve Economic Data) database and may not reflect current market offerings.
          </p>
        </footer>

      </main>

      <StickyCtaBar visible={hasTouchedSlider} onBreakdown={onBreakdown} />
    </div>
  );
}
