/**
 * Section 02 — Amortization Table
 * Precision Ledger Design System
 * Full amortization schedule with extra payment comparison.
 * Shows payoff date, interest savings, and year-by-year breakdown.
 */

import { useState, useMemo } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatMonths } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, TrendingDown, Calendar, DollarSign } from 'lucide-react';

const PAGE_SIZE = 12;

export default function AmortizationSection() {
  const { inputs, derived } = useCalculator();
  const [showExtra, setShowExtra] = useState(false);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');

  const schedule = showExtra ? derived.amortizationWithExtra : derived.amortizationSchedule;

  // Annual summary rows
  const annualRows = useMemo(() => {
    const byYear: { [year: number]: { principal: number; interest: number; balance: number; homeValue: number; equity: number } } = {};
    for (const row of schedule) {
      if (!byYear[row.year]) byYear[row.year] = { principal: 0, interest: 0, balance: 0, homeValue: 0, equity: 0 };
      byYear[row.year].principal += row.principal;
      byYear[row.year].interest += row.interest;
      byYear[row.year].balance = row.balance;
      byYear[row.year].homeValue = row.homeValue;
      byYear[row.year].equity = row.equity;
    }
    return Object.entries(byYear).map(([year, data]) => ({ year: parseInt(year), ...data }));
  }, [schedule]);

  // Chart data (annual)
  const chartData = annualRows.map(row => ({
    year: `Yr ${row.year}`,
    'Principal Paid': Math.round(row.principal),
    'Interest Paid': Math.round(row.interest),
    'Remaining Balance': Math.round(row.balance),
    'Home Value': Math.round(row.homeValue),
  }));

  // Pagination for monthly view
  const monthlyRows = schedule;
  const totalPages = Math.ceil(monthlyRows.length / PAGE_SIZE);
  const pagedRows = monthlyRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const hasExtra = inputs.extraMonthlyPayment > 0;

  return (
    <section id="amortization" className="py-12">
      <div className="section-divider mb-12" />

      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">02</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 02</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Amortization Schedule</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Every dollar of every payment — broken down into principal and interest. See exactly how your loan balance shrinks over time, and how extra payments can save you thousands.
          </p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <p className="slider-label mb-1">Monthly Payment</p>
          <p className="font-mono-data text-xl font-700 text-blue-700">
            {formatCurrency(derived.monthlyMortgagePI)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Principal & Interest only</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <p className="slider-label mb-1">Loan Amount</p>
          <p className="font-mono-data text-xl font-700 text-gray-800">
            {formatCurrency(derived.loanAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">After {inputs.downPaymentPct}% down</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <p className="slider-label mb-1">Total Interest (Standard)</p>
          <p className="font-mono-data text-xl font-700 text-red-700">
            {formatCurrency(derived.totalInterestStandard)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Over {inputs.loanTermYears} years</p>
        </div>
        <div className={`border rounded-lg p-4 shadow-sm ${hasExtra ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
          <p className="slider-label mb-1">Interest Savings</p>
          <p className={`font-mono-data text-xl font-700 ${hasExtra ? 'text-green-700' : 'text-gray-400'}`}>
            {hasExtra ? formatCurrency(derived.interestSavings) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {hasExtra ? `With +${formatCurrency(inputs.extraMonthlyPayment)}/mo extra` : 'Add extra payment to see savings'}
          </p>
        </div>
      </div>

      {/* Extra payment comparison */}
      {hasExtra && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="slider-label text-green-700 mb-1">Standard Payoff</p>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-600" />
                <span className="font-mono-data font-600 text-gray-800">{derived.payoffDateStandard}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatMonths(derived.payoffMonthStandard)}</p>
            </div>
            <div>
              <p className="slider-label text-green-700 mb-1">With Extra Payments</p>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-600" />
                <span className="font-mono-data font-600 text-green-700">{derived.payoffDateWithExtra}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatMonths(derived.payoffMonthWithExtra)}</p>
            </div>
            <div>
              <p className="slider-label text-green-700 mb-1">You Save</p>
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-green-600" />
                <span className="font-mono-data font-700 text-green-700 text-lg">{formatCurrency(derived.interestSavings)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paid off {formatMonths(derived.payoffMonthStandard - derived.payoffMonthWithExtra)} earlier
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-600 text-gray-800">Balance vs. Home Value Over Time</h3>
          <div className="flex items-center gap-3">
            {hasExtra && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-extra"
                  checked={showExtra}
                  onCheckedChange={setShowExtra}
                />
                <Label htmlFor="show-extra" className="text-xs text-gray-600 cursor-pointer">
                  Show extra payment schedule
                </Label>
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="homeValueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
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
            <Area type="monotone" dataKey="Remaining Balance" stroke="#DC2626" strokeWidth={2} fill="url(#balanceGrad)" />
            <Area type="monotone" dataKey="Home Value" stroke="#1D4ED8" strokeWidth={2} fill="url(#homeValueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-display text-sm font-600 text-gray-800">
            {viewMode === 'annual' ? 'Annual Summary' : 'Monthly Detail'}
          </h3>
          <div className="flex items-center gap-3">
            {hasExtra && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-extra-table"
                  checked={showExtra}
                  onCheckedChange={setShowExtra}
                />
                <Label htmlFor="show-extra-table" className="text-xs text-gray-600 cursor-pointer">
                  Extra payments
                </Label>
              </div>
            )}
            <div className="flex rounded border border-gray-200 overflow-hidden">
              <button
                onClick={() => { setViewMode('annual'); setPage(0); }}
                className={`px-3 py-1 text-xs font-medium transition-colors ${viewMode === 'annual' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Annual
              </button>
              <button
                onClick={() => { setViewMode('monthly'); setPage(0); }}
                className={`px-3 py-1 text-xs font-medium transition-colors ${viewMode === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'annual' ? (
            <table className="amort-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Year</th>
                  <th className="text-right">Principal Paid</th>
                  <th className="text-right">Interest Paid</th>
                  <th className="text-right">Remaining Balance</th>
                  <th className="text-right">Home Value</th>
                  <th className="text-right">Equity</th>
                </tr>
              </thead>
              <tbody>
                {annualRows.map(row => (
                  <tr key={row.year} className={row.year % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="font-semibold text-gray-700">Year {row.year}</td>
                    <td className="text-right gain-text">{formatCurrency(row.principal)}</td>
                    <td className="text-right loss-text">{formatCurrency(row.interest)}</td>
                    <td className="text-right text-gray-700">{formatCurrency(row.balance)}</td>
                    <td className="text-right text-blue-700">{formatCurrency(row.homeValue)}</td>
                    <td className="text-right font-semibold gain-text">{formatCurrency(row.equity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <table className="amort-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Month</th>
                    <th className="text-right">Payment</th>
                    <th className="text-right">Principal</th>
                    <th className="text-right">Interest</th>
                    <th className="text-right">Balance</th>
                    <th className="text-right">Equity</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map(row => (
                    <tr key={row.month} className={row.month % 2 === 0 ? 'bg-gray-50/50' : ''}>
                      <td className="text-gray-600">Mo {row.month} <span className="text-gray-400 text-xs">(Yr {row.year})</span></td>
                      <td className="text-right text-gray-700">{formatCurrency(row.payment)}</td>
                      <td className="text-right gain-text">{formatCurrency(row.principal)}</td>
                      <td className="text-right loss-text">{formatCurrency(row.interest)}</td>
                      <td className="text-right text-gray-700">{formatCurrency(row.balance)}</td>
                      <td className="text-right font-semibold gain-text">{formatCurrency(row.equity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Showing months {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, monthlyRows.length)} of {monthlyRows.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs text-gray-600 font-mono-data">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
