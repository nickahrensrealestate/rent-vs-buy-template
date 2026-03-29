/**
 * Section 05 — Lease Break vs. Wait a Year
 * Precision Ledger Design System
 * Compares the cost of breaking a lease now vs. waiting 12 months to buy.
 * Shows that the home price increase usually exceeds the lease break penalty.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency } from '@/lib/format';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Home, DollarSign } from 'lucide-react';

export default function LeaseBreakSection() {
  const { inputs, derived } = useCalculator();
  const {
    leaseBreakCost,
    costOfWaitingOneYear,
    homeValueInOneYear,
    additionalDownNeeded,
    leaseBreakVsWait,
  } = derived;

  const priceIncreaseMonthly = costOfWaitingOneYear / 12;
  const monthsToBreakEven = leaseBreakCost / priceIncreaseMonthly;

  // Cost of waiting broken down
  const higherPurchasePrice = costOfWaitingOneYear;
  const additionalInterestLifetime = higherPurchasePrice * (inputs.interestRate / 100 / 12) * inputs.loanTermYears * 12 * 0.5; // rough estimate
  const totalCostOfWaiting = higherPurchasePrice + additionalDownNeeded;

  const breakIsBetter = leaseBreakCost < totalCostOfWaiting;

  return (
    <section id="lease-break" className="py-12">
      <div className="section-divider mb-12" />

      {/* Section header */}
      <div className="relative mb-8">
        <span className="section-number">05</span>
        <div className="relative z-10 pl-12">
          <p className="slider-label mb-1">Section 05</p>
          <h2 className="font-display text-2xl font-700 text-gray-900 mb-1">Break the Lease or Wait?</h2>
          <p className="text-gray-500 text-sm max-w-xl">
            Most people think waiting until their lease ends is the "safe" choice. But in a rising market, waiting 12 months often costs far more than the lease break fee. Here's the math.
          </p>
        </div>
      </div>

      {/* Verdict banner */}
      <div className={`mb-8 p-5 rounded-xl border-2 ${breakIsBetter ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
        <div className="flex items-center gap-3">
          {breakIsBetter ? (
            <CheckCircle size={28} className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle size={28} className="text-amber-600 flex-shrink-0" />
          )}
          <div>
            <h3 className={`font-display text-lg font-700 ${breakIsBetter ? 'text-green-800' : 'text-amber-800'}`}>
              {breakIsBetter
                ? 'Breaking your lease is likely the smarter financial move.'
                : 'In this scenario, waiting may make more sense — but it\'s close.'}
            </h3>
            <p className={`text-sm mt-1 ${breakIsBetter ? 'text-green-700' : 'text-amber-700'}`}>
              {breakIsBetter
                ? `Your lease break fee (${formatCurrency(leaseBreakCost)}) is less than the cost of waiting one year (${formatCurrency(totalCostOfWaiting)} in higher purchase price + extra down payment).`
                : `Your lease break fee (${formatCurrency(leaseBreakCost)}) exceeds the projected cost of waiting (${formatCurrency(totalCostOfWaiting)}). Consider negotiating the fee or timing.`}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Break the lease */}
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <CheckCircle size={15} className="text-green-700" />
            </div>
            <h3 className="font-display text-base font-700 text-gray-900">Break the Lease Now</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Lease break fee</span>
              <span className="font-mono-data font-700 text-red-700">{formatCurrency(leaseBreakCost)}</span>
            </div>
            <div className="text-xs text-gray-400 pl-1">
              = {inputs.leaseBreakMonths} months × {formatCurrency(inputs.monthlyRent)}/mo rent
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-sm text-green-700 font-medium">Buy at today's price</span>
              <span className="font-mono-data font-700 text-green-800">{formatCurrency(inputs.homePrice)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Today's down payment</span>
              <span className="font-mono-data font-700 text-gray-700">{formatCurrency(derived.downPaymentAmount)}</span>
            </div>

            <div className="mt-2 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-600 text-gray-700">Total one-time cost</span>
                <span className="font-mono-data text-lg font-700 text-gray-900">
                  {formatCurrency(leaseBreakCost + derived.totalCashNeeded)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wait a year */}
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
              <Clock size={15} className="text-amber-700" />
            </div>
            <h3 className="font-display text-base font-700 text-gray-900">Wait Until Lease Ends (12 mo)</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-200">
              <span className="text-sm text-amber-700">Home price in 12 months</span>
              <span className="font-mono-data font-700 text-amber-800">{formatCurrency(homeValueInOneYear)}</span>
            </div>
            <div className="text-xs text-gray-400 pl-1">
              = {inputs.appreciationRate}% appreciation on {formatCurrency(inputs.homePrice)}
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm text-red-700">Price increase you absorb</span>
              <span className="font-mono-data font-700 text-red-700">+{formatCurrency(costOfWaitingOneYear)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm text-red-700">Extra down payment needed</span>
              <span className="font-mono-data font-700 text-red-700">+{formatCurrency(additionalDownNeeded)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Rent paid while waiting</span>
              <span className="font-mono-data font-700 text-gray-700">{formatCurrency(inputs.monthlyRent * 12)}</span>
            </div>

            <div className="mt-2 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-600 text-gray-700">Extra cost vs. buying now</span>
                <span className="font-mono-data text-lg font-700 text-red-700">
                  +{formatCurrency(totalCostOfWaiting)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-display text-sm font-600 text-gray-800 mb-4">
          Home Appreciation vs. Lease Break Fee — Month by Month
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          The home appreciates ~{formatCurrency(priceIncreaseMonthly)}/month. Your lease break fee of {formatCurrency(leaseBreakCost)} is recouped by the market in approximately{' '}
          <strong className="text-gray-700">{monthsToBreakEven.toFixed(1)} months</strong> of appreciation.
        </p>

        {/* Visual timeline bars */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 6, 9, 12].map(month => {
            const appreciation = priceIncreaseMonthly * month;
            const maxVal = Math.max(leaseBreakCost, priceIncreaseMonthly * 12) * 1.1;
            const breakPct = Math.min((leaseBreakCost / maxVal) * 100, 100);
            const appPct = Math.min((appreciation / maxVal) * 100, 100);
            const appWins = appreciation > leaseBreakCost;

            return (
              <div key={month} className="flex items-center gap-3">
                <span className="font-mono-data text-xs text-gray-500 w-12 text-right">Mo {month}</span>
                <div className="flex-1 relative h-6">
                  {/* Appreciation bar */}
                  <div
                    className={`absolute top-0 left-0 h-full rounded transition-all duration-300 ${appWins ? 'bg-green-500' : 'bg-blue-400'}`}
                    style={{ width: `${appPct}%` }}
                  />
                  {/* Lease break line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-red-500"
                    style={{ left: `${breakPct}%` }}
                  />
                </div>
                <span className={`font-mono-data text-xs w-20 text-right ${appWins ? 'text-green-700 font-600' : 'text-blue-700'}`}>
                  {formatCurrency(appreciation)}
                </span>
                {appWins && <span className="text-xs text-green-600 font-600">✓ Ahead</span>}
              </div>
            );
          })}
          <div className="flex items-center gap-3 pt-1">
            <span className="w-12" />
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-400 rounded-sm inline-block" /> Home appreciation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-0.5 h-3 bg-red-500 inline-block" /> Lease break fee ({formatCurrency(leaseBreakCost)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="p-4 bg-gray-900 text-white rounded-lg">
        <div className="flex items-start gap-3">
          <TrendingUp size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-display text-sm font-600 mb-1">The Key Insight</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Denver home prices have appreciated an average of {inputs.appreciationRate}% per year. On a {formatCurrency(inputs.homePrice)} home, that's{' '}
              <strong className="text-white">{formatCurrency(costOfWaitingOneYear)}</strong> in the first year alone —{' '}
              {leaseBreakCost > 0 ? `${(costOfWaitingOneYear / leaseBreakCost).toFixed(1)}× your lease break fee` : 'more than you might expect'}.
              Every month you wait, the home you want costs more. Breaking a lease is often the most financially sound decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
