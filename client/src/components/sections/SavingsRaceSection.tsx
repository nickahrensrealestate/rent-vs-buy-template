/**
 * Section 06 — Savings Race vs. Home Appreciation
 * Precision Ledger Design System
 * Shows how monthly savings for a down payment compares to home price appreciation.
 * Key insight: if you can only save $500/mo, home prices go up faster than you can save.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency } from '@/lib/format';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function SavingsRaceSection() {
  const { inputs, derived } = useCalculator();
  const { savingsRaceData } = derived;

  // Find the month where savings overtakes appreciation (if ever)
  const breakEvenMonth = savingsRaceData.find(d => d.savings >= d.homeValueGain);
  const neverCatchUp = !breakEvenMonth;

  // Monthly home appreciation
  const monthlyAppreciation = inputs.homePrice * (inputs.appreciationRate / 100 / 12);

  // How many months to save current down payment
  const downPaymentNeeded = derived.downPaymentAmount;
  const monthsToSaveDown = inputs.monthlySavingsAmount > 0
    ? downPaymentNeeded / inputs.monthlySavingsAmount
    : Infinity;

  // Home price when you finally save the down payment
  const homePriceWhenReady = inputs.homePrice * Math.pow(1 + inputs.appreciationRate / 100 / 12, monthsToSaveDown);
  const newDownPaymentNeeded = homePriceWhenReady * (inputs.downPaymentPct / 100);
  const shortfall = newDownPaymentNeeded - downPaymentNeeded;

  // Chart data — monthly savings vs. home appreciation over 72 months
  const chartData = Array.from({ length: 73 }, (_, i) => {
    const month = i;
    const savings = inputs.monthlySavingsAmount * month;
    const homeGain = inputs.homePrice * (Math.pow(1 + inputs.appreciationRate / 100 / 12, month) - 1);
    return {
      month,
      'Your Savings': Math.round(savings),
      'Home Price Increase': Math.round(homeGain),
      gap: Math.round(homeGain - savings),
    };
  });

  const isWinning = inputs.monthlySavingsAmount > monthlyAppreciation;

  return (
    <section id="savings-race" className="py-12">
      <div className="section-divider mb-12" />

      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">06</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 06</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">The Savings Race</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Can you save your way to a bigger down payment? Or does the home you want keep getting more expensive faster than you can save? This is the race most renters don't realize they're losing.
          </p>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <p className="slider-label mb-1">You Save Monthly</p>
          <p className="font-mono-data text-2xl font-700 text-blue-700">
            {formatCurrency(inputs.monthlySavingsAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Toward your down payment</p>
        </div>
        <div className={`border rounded-lg p-4 shadow-sm ${isWinning ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="slider-label mb-1">Home Appreciates Monthly</p>
          <p className={`font-mono-data text-2xl font-700 ${isWinning ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(monthlyAppreciation)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {inputs.appreciationRate}% / yr on {formatCurrency(inputs.homePrice)}
          </p>
        </div>
        <div className={`border rounded-lg p-4 shadow-sm ${isWinning ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="slider-label mb-1">Monthly Gap</p>
          <p className={`font-mono-data text-2xl font-700 ${isWinning ? 'text-green-700' : 'text-red-700'}`}>
            {isWinning ? '+' : '-'}{formatCurrency(Math.abs(inputs.monthlySavingsAmount - monthlyAppreciation))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isWinning ? 'You\'re gaining ground' : 'You\'re falling behind'}
          </p>
        </div>
      </div>

      {/* Verdict */}
      <div className={`mb-8 p-5 rounded-xl border-2 ${isWinning ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <div className="flex items-start gap-3">
          {isWinning ? (
            <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className={`font-display text-base font-700 ${isWinning ? 'text-green-800' : 'text-red-800'}`}>
              {isWinning
                ? 'You\'re saving faster than prices are rising — great position!'
                : 'Home prices are rising faster than you can save.'}
            </h3>
            <p className={`text-sm mt-1 ${isWinning ? 'text-green-700' : 'text-red-700'}`}>
              {isWinning
                ? `At ${formatCurrency(inputs.monthlySavingsAmount)}/mo, you're outpacing the ${formatCurrency(monthlyAppreciation)}/mo appreciation. You'll reach your down payment goal before the goalposts move significantly.`
                : `At ${formatCurrency(inputs.monthlySavingsAmount)}/mo, the home you want goes up ${formatCurrency(monthlyAppreciation)}/mo. For every dollar you save, the home gets ${((monthlyAppreciation / inputs.monthlySavingsAmount) * 100).toFixed(0)}¢ more expensive. You're falling behind by ${formatCurrency(monthlyAppreciation - inputs.monthlySavingsAmount)}/month.`}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-1">
          Savings Accumulated vs. Home Price Increase (6 Years)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Blue = what you've saved. Red = how much more expensive the home has become. The gap is what you're losing.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="appreciationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v % 12 === 0 ? `Yr ${v / 12}` : ''}
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
                const month = label as number;
                const yr = Math.floor(month / 12);
                const mo = month % 12;
                return (
                  <div className="custom-tooltip">
                    <p className="font-semibold text-gray-700 mb-1">
                      Month {month} {yr > 0 ? `(Yr ${yr}${mo > 0 ? `, Mo ${mo}` : ''})` : ''}
                    </p>
                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }} className="font-mono-data text-xs">
                        {p.name}: {formatCurrency(p.value as number)}
                      </p>
                    ))}
                    {payload.length >= 2 && (
                      <p className="text-xs text-gray-500 mt-1 border-t pt-1">
                        Gap: {formatCurrency(Math.abs((payload[1].value as number) - (payload[0].value as number)))}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans' }} />
            <Area type="monotone" dataKey="Your Savings" stroke="#1D4ED8" strokeWidth={2} fill="url(#savingsGrad)" />
            <Area type="monotone" dataKey="Home Price Increase" stroke="#DC2626" strokeWidth={2} fill="url(#appreciationGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Down payment race */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">
          The Down Payment Moving Target
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm text-blue-700">Down payment needed today</span>
              <span className="font-mono-data font-700 text-blue-800">{formatCurrency(downPaymentNeeded)}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">At {formatCurrency(inputs.monthlySavingsAmount)}/mo, you reach it in</span>
              <span className="font-mono-data font-700 text-gray-800">
                {monthsToSaveDown === Infinity ? '∞' : `${Math.ceil(monthsToSaveDown)} months`}
              </span>
            </div>
            {monthsToSaveDown !== Infinity && (
              <>
                <div className="flex justify-between p-3 bg-amber-50 rounded border border-amber-200">
                  <span className="text-sm text-amber-700">Home price by then</span>
                  <span className="font-mono-data font-700 text-amber-800">{formatCurrency(homePriceWhenReady)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded border border-red-200">
                  <span className="text-sm text-red-700">New down payment needed</span>
                  <span className="font-mono-data font-700 text-red-800">{formatCurrency(newDownPaymentNeeded)}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded border border-red-200">
                  <span className="text-sm text-red-700 font-600">Shortfall (goalposts moved)</span>
                  <span className="font-mono-data font-700 text-red-800">+{formatCurrency(shortfall)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-4 bg-gray-900 text-white rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Zap size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="font-display text-sm font-600">The Treadmill Effect</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Every month you save, the home gets more expensive. To save enough to keep up with a {inputs.appreciationRate}% appreciation rate on a {formatCurrency(inputs.homePrice)} home, you'd need to save at least{' '}
                <strong className="text-white">{formatCurrency(monthlyAppreciation)}/month</strong> just to stay even — before you've saved a single dollar toward your goal.
              </p>
              {!isWinning && (
                <p className="text-yellow-300 text-xs mt-2 font-medium">
                  ↑ Try increasing your savings amount in the left panel to see when you break even.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Required savings to keep up */}
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-xs text-gray-500 text-center">
          <strong>To save faster than home prices rise</strong> on a {formatCurrency(inputs.homePrice)} home at {inputs.appreciationRate}% appreciation,
          you need to save at least <strong className="text-gray-800">{formatCurrency(monthlyAppreciation)}/month</strong> just to break even.
          To actually make progress, you'd need to save more than that.
        </p>
      </div>
    </section>
  );
}
