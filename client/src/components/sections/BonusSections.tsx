/**
 * Bonus Sections — Precision Ledger Design System
 * Section 07: Opportunity Cost (what if you invested the down payment?)
 * Section 08: Mortgage Interest Tax Benefit Estimator
 * Section 09: True Cost of Renting (cumulative rent paid over time)
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, PiggyBank, FileText, Home, AlertCircle } from 'lucide-react';

// ─── Section 07: Opportunity Cost ───────────────────────────────────────────

export function OpportunityCostSection() {
  const { inputs, derived } = useCalculator();

  const { totalCashNeeded, loanAmount, monthlyMortgagePI } = derived;
  const monthlyRate = inputs.investmentReturnRate / 100 / 12;

  // What if you invested the down payment in the stock market?
  const milestones = [1, 5, 10, 20, 30];
  const data = milestones.map(years => {
    const m = years * 12;
    const investedValue = totalCashNeeded * Math.pow(1 + monthlyRate, m);
    const homeValue = inputs.homePrice * Math.pow(1 + inputs.appreciationRate / 100, years);
    const loanRow = derived.amortizationSchedule[Math.min(m - 1, derived.amortizationSchedule.length - 1)];
    const homeEquity = loanRow ? loanRow.equity : homeValue;
    return {
      year: `${years}yr`,
      'Invested Down Payment': Math.round(investedValue),
      'Home Equity': Math.round(homeEquity),
    };
  });

  return (
    <section id="opportunity-cost" className="py-12">
      <div className="section-divider mb-12" />

      <div className="relative mb-8">
        <span className="section-number">07</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 07</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Opportunity Cost</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            What if instead of a down payment, you invested that money in the stock market? This compares the growth of your invested down payment versus your home equity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank size={16} className="text-blue-600" />
            <h3 className="font-display text-sm font-600 text-gray-800">Down Payment Invested at {inputs.investmentReturnRate}%/yr</h3>
          </div>
          <div className="space-y-2">
            {milestones.map(years => {
              const m = years * 12;
              const val = totalCashNeeded * Math.pow(1 + monthlyRate, m);
              return (
                <div key={years} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{years === 1 ? '1 Year' : `${years} Years`}</span>
                  <span className="font-mono-data font-700 text-blue-700">{formatCurrencyCompact(val)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Starting with {formatCurrency(totalCashNeeded)} invested at {inputs.investmentReturnRate}% annual return
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Home size={16} className="text-green-600" />
            <h3 className="font-display text-sm font-600 text-gray-800">Home Equity at {inputs.appreciationRate}%/yr Appreciation</h3>
          </div>
          <div className="space-y-2">
            {milestones.map(years => {
              const m = years * 12;
              const loanRow = derived.amortizationSchedule[Math.min(m - 1, derived.amortizationSchedule.length - 1)];
              const equity = loanRow ? loanRow.equity : 0;
              return (
                <div key={years} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{years === 1 ? '1 Year' : `${years} Years`}</span>
                  <span className="font-mono-data font-700 text-green-700">{formatCurrencyCompact(equity)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Equity = Home value − Remaining loan balance
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">Invested Down Payment vs. Home Equity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="25%">
            <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
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
            <Bar dataKey="Invested Down Payment" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Home Equity" fill="#166534" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ─── Section 08: Tax Benefit Estimator ──────────────────────────────────────

export function TaxBenefitSection() {
  const { inputs, derived } = useCalculator();

  // Rough mortgage interest deduction estimate
  // Standard deduction 2026: $15,000 single / $30,000 married
  const standardDeductionSingle = 15000;
  const standardDeductionMarried = 30000;

  // First year interest
  const firstYearInterest = derived.amortizationSchedule
    .filter(r => r.year === 1)
    .reduce((sum, r) => sum + r.interest, 0);

  // Property tax deduction (capped at $10K SALT)
  const annualPropertyTax = inputs.homePrice * inputs.propertyTaxRate / 100;
  const saltDeduction = Math.min(annualPropertyTax, 10000);

  const totalItemized = firstYearInterest + saltDeduction;
  const benefitSingle = Math.max(0, totalItemized - standardDeductionSingle);
  const benefitMarried = Math.max(0, totalItemized - standardDeductionMarried);

  // Estimated tax savings at 22% and 24% brackets
  const taxSavings22Single = benefitSingle * 0.22;
  const taxSavings24Single = benefitSingle * 0.24;
  const taxSavings22Married = benefitMarried * 0.22;
  const taxSavings24Married = benefitMarried * 0.24;

  return (
    <section id="tax-benefit" className="py-12">
      <div className="section-divider mb-12" />

      <div className="relative mb-8">
        <span className="section-number">08</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 08</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Mortgage Interest Tax Benefit</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Homeowners may deduct mortgage interest and property taxes if they itemize deductions. Here's a rough estimate of your potential tax savings in year one.
          </p>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Disclaimer:</strong> This is a rough educational estimate only. Tax situations vary significantly. Consult a licensed CPA or tax professional before making decisions based on tax benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <h3 className="font-display text-sm font-600 text-gray-800 mb-4">Year 1 Deductions</h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Mortgage interest paid</span>
              <span className="font-mono-data font-700 text-gray-800">{formatCurrency(firstYearInterest)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Property tax (SALT, capped $10K)</span>
              <span className="font-mono-data font-700 text-gray-800">{formatCurrency(saltDeduction)}</span>
            </div>
            <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-sm text-blue-700 font-600">Total itemized deductions</span>
              <span className="font-mono-data font-700 text-blue-800">{formatCurrency(totalItemized)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <h3 className="font-display text-sm font-600 text-gray-800 mb-4">Estimated Tax Savings</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Single Filer (std. deduction: $15,000)</p>
              <div className="flex justify-between p-2 bg-green-50 rounded">
                <span className="text-sm text-gray-600">At 22% bracket</span>
                <span className="font-mono-data font-700 text-green-700">{formatCurrency(taxSavings22Single)}</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded mt-1">
                <span className="text-sm text-gray-600">At 24% bracket</span>
                <span className="font-mono-data font-700 text-green-700">{formatCurrency(taxSavings24Single)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Married Filing Jointly (std. deduction: $30,000)</p>
              <div className="flex justify-between p-2 bg-green-50 rounded">
                <span className="text-sm text-gray-600">At 22% bracket</span>
                <span className="font-mono-data font-700 text-green-700">{formatCurrency(taxSavings22Married)}</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded mt-1">
                <span className="text-sm text-gray-600">At 24% bracket</span>
                <span className="font-mono-data font-700 text-green-700">{formatCurrency(taxSavings24Married)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 09: True Cost of Renting ───────────────────────────────────────

export function TrueCostRentingSection() {
  const { inputs, derived } = useCalculator();

  const milestones = [1, 5, 10, 20, 30];

  const data = milestones.map(years => {
    let cumRent = 0;
    let currentRent = inputs.monthlyRent;
    for (let m = 0; m < years * 12; m++) {
      if (m > 0 && m % 12 === 0) currentRent *= (1 + inputs.rentInflationRate / 100);
      cumRent += currentRent;
    }
    const rentAtEnd = inputs.monthlyRent * Math.pow(1 + inputs.rentInflationRate / 100, years);
    return {
      year: `${years}yr`,
      years,
      cumulativeRent: Math.round(cumRent),
      rentAtEnd: Math.round(rentAtEnd),
    };
  });

  const thirtyYearRent = data.find(d => d.years === 30)?.cumulativeRent || 0;
  const rentIn30Years = data.find(d => d.years === 30)?.rentAtEnd || 0;

  return (
    <section id="true-cost-renting" className="py-12">
      <div className="section-divider mb-12" />

      <div className="relative mb-8">
        <span className="section-number">09</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 09</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">True Cost of Renting</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Every dollar of rent is gone forever — no equity, no asset, no return. Here's how much you'll pay in total rent over time, assuming {inputs.rentInflationRate}% annual increases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="slider-label text-red-700 mb-1">Rent Today</p>
          <p className="font-mono-data text-2xl font-700 text-red-800">{formatCurrency(inputs.monthlyRent)}/mo</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="slider-label text-red-700 mb-1">Rent in 30 Years</p>
          <p className="font-mono-data text-2xl font-700 text-red-800">{formatCurrency(rentIn30Years)}/mo</p>
          <p className="text-xs text-red-600 mt-1">At {inputs.rentInflationRate}%/yr inflation</p>
        </div>
        <div className="bg-red-900 text-white rounded-lg p-4">
          <p className="text-red-300 text-xs uppercase tracking-wider mb-1">Total Rent Paid (30 yrs)</p>
          <p className="font-mono-data text-2xl font-700">{formatCurrencyCompact(thirtyYearRent)}</p>
          <p className="text-red-300 text-xs mt-1">Zero equity at the end</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">Cumulative Rent Paid Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="40%">
            <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div className="custom-tooltip">
                    <p className="font-semibold text-gray-700 mb-1">{label}</p>
                    <p className="font-mono-data text-xs text-red-700">
                      Total rent paid: {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="cumulativeRent" fill="#DC2626" radius={[4, 4, 0, 0]} name="Cumulative Rent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Final comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-display text-sm font-700 text-red-800 mb-2">Renter after 30 years</p>
          <ul className="space-y-1 text-sm text-red-700">
            <li>✗ Paid {formatCurrencyCompact(thirtyYearRent)} in rent</li>
            <li>✗ $0 equity or assets from housing</li>
            <li>✗ Still paying rent (now {formatCurrency(rentIn30Years)}/mo)</li>
            <li>✗ Subject to landlord decisions</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-display text-sm font-700 text-green-800 mb-2">Homeowner after 30 years</p>
          <ul className="space-y-1 text-sm text-green-700">
            <li>✓ Home fully paid off</li>
            <li>✓ Home value: {formatCurrency(inputs.homePrice * Math.pow(1 + inputs.appreciationRate / 100, 30))}</li>
            <li>✓ $0/mo housing cost (just taxes + insurance)</li>
            <li>✓ Asset to sell, rent, or pass on</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
