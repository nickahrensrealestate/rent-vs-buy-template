/**
 * Section 01 — Monthly Cost Comparison
 * Precision Ledger Design System
 * Side-by-side breakdown of renting vs. buying monthly costs.
 * Shows PITI (Principal + Interest + Tax + Insurance) + HOA + Maintenance vs. Rent.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Home, Key, TrendingDown, TrendingUp, Info } from 'lucide-react';

function CostRow({ label, value, sub, color }: { label: string; value: number; sub?: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {sub && <span className="text-xs text-gray-400 ml-1">({sub})</span>}
      </div>
      <span className={`font-mono-data text-sm font-semibold ${color || 'text-gray-800'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function WinnerChip({ winner }: { winner: 'rent' | 'buy' | 'tie' }) {
  if (winner === 'tie') return <span className="winner-badge bg-gray-100 text-gray-600 border-gray-200">Tie</span>;
  if (winner === 'rent') return (
    <span className="winner-badge bg-amber-50 text-amber-700 border-amber-200">
      Renting costs less monthly
    </span>
  );
  return (
    <span className="winner-badge">
      Buying costs less monthly
    </span>
  );
}

export default function MonthlyCostSection() {
  const { inputs, derived } = useCalculator();
  const {
    monthlyMortgagePI, monthlyPropertyTax, monthlyInsurance, monthlyMaintenance,
    totalMonthlyOwnership, totalMonthlyRent,
  } = derived;

  const diff = totalMonthlyOwnership - totalMonthlyRent;
  const winner: 'rent' | 'buy' | 'tie' = diff > 10 ? 'rent' : diff < -10 ? 'buy' : 'tie';

  const chartData = [
    { name: 'Renting', value: totalMonthlyRent, fill: '#D97706' },
    { name: 'Buying', value: totalMonthlyOwnership, fill: '#1D4ED8' },
  ];

  const ownershipBreakdown = [
    { label: 'Principal & Interest', value: monthlyMortgagePI, sub: 'P&I' },
    { label: 'Property Tax', value: monthlyPropertyTax, sub: `${inputs.propertyTaxRate}% / yr` },
    { label: 'Home Insurance', value: monthlyInsurance, sub: `${inputs.homeInsuranceRate}% / yr` },
    { label: 'Maintenance', value: monthlyMaintenance, sub: `${inputs.maintenanceRate}% / yr` },
    { label: 'HOA', value: inputs.hoaMonthly, sub: 'monthly' },
  ];

  return (
    <section id="monthly-cost" className="py-12">
      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">01</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 01</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Monthly Cost Comparison</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            What does it actually cost each month? This breaks down every dollar of renting versus owning — including the hidden costs most buyers forget.
          </p>
        </div>
      </div>

      {/* Main comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rent column */}
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
              <Key size={15} className="text-amber-700" />
            </div>
            <div>
              <p className="slider-label">Monthly Renting</p>
              <h3 className="font-display text-lg font-700 text-gray-900">Total Rent Cost</h3>
            </div>
          </div>

          <div className="mb-4">
            <span className="font-mono-data text-3xl font-700 text-amber-700">
              {formatCurrency(totalMonthlyRent)}
            </span>
            <span className="text-gray-400 text-sm ml-1">/ month</span>
          </div>

          <div className="space-y-0">
            <CostRow label="Monthly Rent" value={inputs.monthlyRent} />
            <CostRow label="Renter's Insurance" value={inputs.renterInsurance} />
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded text-xs text-amber-800 leading-relaxed">
            <Info size={11} className="inline mr-1" />
            Your rent will increase approximately <strong>{inputs.rentInflationRate}% per year</strong>.
            In 5 years, your rent could be <strong>{formatCurrency(inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, 5))}/mo</strong>.
          </div>
        </div>

        {/* Buy column */}
        <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-sm ring-1 ring-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <Home size={15} className="text-blue-700" />
            </div>
            <div>
              <p className="slider-label">Monthly Ownership</p>
              <h3 className="font-display text-lg font-700 text-gray-900">Total Buy Cost</h3>
            </div>
          </div>

          <div className="mb-4">
            <span className="font-mono-data text-3xl font-700 text-blue-700">
              {formatCurrency(totalMonthlyOwnership)}
            </span>
            <span className="text-gray-400 text-sm ml-1">/ month</span>
          </div>

          <div className="space-y-0">
            {ownershipBreakdown.map(item => (
              <CostRow key={item.label} label={item.label} value={item.value} sub={item.sub} />
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800 leading-relaxed">
            <Info size={11} className="inline mr-1" />
            Your mortgage payment stays <strong>fixed</strong> for {inputs.loanTermYears} years.
            Only taxes, insurance & HOA may increase.
          </div>
        </div>

        {/* Comparison column */}
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <p className="slider-label mb-1">Monthly Difference</p>
            <h3 className="font-display text-lg font-700 text-gray-900">Side-by-Side</h3>
          </div>

          {/* Bar chart */}
          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="custom-tooltip">
                        <p className="font-semibold text-gray-800">{payload[0].name}</p>
                        <p className="font-mono-data text-blue-700">{formatCurrency(payload[0].value as number)}/mo</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Monthly difference</span>
              <span className={`font-mono-data font-700 text-sm ${diff > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                {diff > 0 ? '+' : ''}{formatCurrency(diff)}/mo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Annual difference</span>
              <span className={`font-mono-data font-700 text-sm ${diff > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                {diff > 0 ? '+' : ''}{formatCurrency(diff * 12)}/yr
              </span>
            </div>

            <div className="p-3 rounded border-2 border-dashed border-gray-200 text-center">
              <WinnerChip winner={winner} />
              {winner === 'rent' && (
                <p className="text-xs text-gray-500 mt-1">
                  But remember — rent goes up. Ownership builds equity.
                </p>
              )}
              {winner === 'buy' && (
                <p className="text-xs text-gray-500 mt-1">
                  And your payment stays fixed while rent rises.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cash to close callout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Down Payment</p>
          <p className="font-mono-data text-xl font-700">{formatCurrency(derived.downPaymentAmount)}</p>
          <p className="text-gray-400 text-xs mt-1">{inputs.downPaymentPct}% of {formatCurrency(inputs.homePrice)}</p>
        </div>
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Closing Costs</p>
          <p className="font-mono-data text-xl font-700">{formatCurrency(derived.closingCosts)}</p>
          <p className="text-gray-400 text-xs mt-1">{inputs.closingCostPct}% of purchase price</p>
        </div>
        <div className="bg-blue-700 text-white rounded-lg p-4">
          <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Total Cash to Close</p>
          <p className="font-mono-data text-xl font-700">{formatCurrency(derived.totalCashNeeded)}</p>
          <p className="text-blue-200 text-xs mt-1">Down payment + closing costs</p>
        </div>
      </div>
    </section>
  );
}
