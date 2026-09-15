/**
 * CalculatorContext — Precision Ledger Design System
 * Global state for all financial inputs and derived calculations.
 * All slider values flow from here to every section.
 *
 * Denver Metro defaults:
 * - Home price: $565,000 (Feb 2026 median)
 * - Down payment: 10% (~$56,500)
 * - Interest rate: 6.38% (Freddie Mac, March 26, 2026)
 * - Property tax: 0.50% annually (Colorado effective rate)
 * - HOA: $150/month
 * - Home insurance: ~0.5% annually
 * - Appreciation: 3% annually (Denver Metro long-run average)
 * - Rent: $2,200/month (Denver Metro median 1BR-2BR)
 * - Rent inflation: 3% annually
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT,
  futureValueOfMonthlyContributions,
} from '@/lib/compound';
import { parseCoreInputsFromSearch } from '@/lib/parentBridge';

export interface CalculatorInputs {
  // Purchase inputs
  homePrice: number;
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;   // annual %
  hoaMonthly: number;
  homeInsuranceRate: number; // annual %
  maintenanceRate: number;   // annual % of home value
  closingCostPct: number;    // buyer closing costs %
  appreciationRate: number;  // annual %

  // Rent inputs
  monthlyRent: number;
  rentInflationRate: number; // annual %
  renterInsurance: number;   // monthly

  // Extra payment
  extraMonthlyPayment: number;

  // Lease break
  leaseBreakMonths: number;  // months of rent as fee

  // Savings race
  monthlySavingsAmount: number;

  // Investment return (for opportunity cost)
  investmentReturnRate: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterestPaid: number;
  equity: number;
  homeValue: number;
}

export interface EquityMilestone {
  years: number;
  equity: number;
  homeValue: number;
  loanBalance: number;
  equityPct: number;
  equityWithExtra: number;
  homeValueWithExtra: number;
  loanBalanceWithExtra: number;
  // Breakdown: equity = downPayment + principalPaid + appreciationGain
  downPaymentAmount: number;
  principalPaid: number;       // loan paydown since purchase
  appreciationGain: number;    // home value increase since purchase
}

export interface NetWorthMilestone {
  years: number;
  ownerNetWorth: number;
  renterNetWorth: number;
  ownerHomeValue: number;
  ownerLoanBalance: number;
  ownerEquity: number;
  renterSavings: number;
  cumulativeRentPaid: number;
  cumulativeMortgagePaid: number;
}

export interface RenterInvestedMilestone {
  years: number;
  investedBalance: number;
  monthlyContribution: number;
}

export interface CalculatorDerived {
  // Monthly costs
  monthlyMortgagePI: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  totalMonthlyOwnership: number;
  totalMonthlyRent: number;

  // Loan details
  loanAmount: number;
  downPaymentAmount: number;
  closingCosts: number;
  totalCashNeeded: number;

  // Amortization
  amortizationSchedule: AmortizationRow[];
  amortizationWithExtra: AmortizationRow[];
  totalInterestStandard: number;
  totalInterestWithExtra: number;
  interestSavings: number;
  payoffMonthStandard: number;
  payoffMonthWithExtra: number;
  payoffDateStandard: string;
  payoffDateWithExtra: string;

  // Equity milestones
  equityMilestones: EquityMilestone[];

  // Net worth milestones
  netWorthMilestones: NetWorthMilestone[];

  // Renter "invest the monthly gap" illustration (S&P 500-like)
  monthlyInvestGap: number;
  renterInvestedMilestones: RenterInvestedMilestone[];
  illustrativeInvestReturnPct: number;

  // Lease break analysis
  leaseBreakCost: number;
  costOfWaitingOneYear: number;
  homeValueInOneYear: number;
  additionalDownNeeded: number;
  leaseBreakVsWait: 'break' | 'wait';

  // Savings race
  savingsRaceData: { month: number; savings: number; homeValueGain: number; gap: number }[];
}

const DEFAULT_INPUTS: CalculatorInputs = {
  homePrice: 565000,
  downPaymentPct: 10,
  interestRate: 6.38,
  loanTermYears: 30,
  propertyTaxRate: 1.0,
  hoaMonthly: 150,
  homeInsuranceRate: 0.50,
  maintenanceRate: 1.0,
  closingCostPct: 2.5,
  appreciationRate: 3.5,
  monthlyRent: 2200,
  rentInflationRate: 3.0,
  renterInsurance: 20,
  extraMonthlyPayment: 0,
  leaseBreakMonths: 2,
  monthlySavingsAmount: 1500,
  // Illustrative S&P 500-like annual return for the "invest the gap" path. Not advice.
  investmentReturnRate: ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT,
};

export { DEFAULT_INPUTS };

function buildAmortization(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  extraPayment: number,
  homePrice: number,
  appreciationRate: number
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const basePayment = monthlyRate === 0
    ? loanAmount / termMonths
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  const rows: AmortizationRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;

  for (let m = 1; m <= termMonths; m++) {
    if (balance <= 0) break;
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(basePayment - interestPayment + extraPayment, balance);
    const actualPayment = interestPayment + principalPayment;
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interestPayment;
    const homeValue = homePrice * Math.pow(1 + appreciationRate / 100 / 12, m);
    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: actualPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      totalInterestPaid: totalInterest,
      equity: homeValue - balance,
      homeValue,
    });
  }
  return rows;
}

function formatPayoffDate(months: number): string {
  const now = new Date(2026, 2, 1); // March 2026
  now.setMonth(now.getMonth() + months);
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function deriveCalculations(inputs: CalculatorInputs): CalculatorDerived {
  const {
    homePrice, downPaymentPct, interestRate, loanTermYears,
    propertyTaxRate, hoaMonthly, homeInsuranceRate, maintenanceRate,
    closingCostPct, appreciationRate, monthlyRent, rentInflationRate,
    renterInsurance, extraMonthlyPayment, leaseBreakMonths,
    monthlySavingsAmount, investmentReturnRate,
  } = inputs;

  const downPaymentAmount = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPaymentAmount;
  const closingCosts = homePrice * (closingCostPct / 100);
  const totalCashNeeded = downPaymentAmount + closingCosts;

  const monthlyRate = interestRate / 100 / 12;
  const termMonths = loanTermYears * 12;
  const monthlyMortgagePI = monthlyRate === 0
    ? loanAmount / termMonths
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  const monthlyPropertyTax = (homePrice * propertyTaxRate / 100) / 12;
  const monthlyInsurance = (homePrice * homeInsuranceRate / 100) / 12;
  const monthlyMaintenance = (homePrice * maintenanceRate / 100) / 12;
  const totalMonthlyOwnership = monthlyMortgagePI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + hoaMonthly;
  const totalMonthlyRent = monthlyRent + renterInsurance;

  // Investable monthly gap: buy − rent, only when buying costs more.
  // If renting costs more monthly, the investable gap is $0 (no extra cash to park in a portfolio).
  const monthlyInvestGap = Math.max(0, totalMonthlyOwnership - totalMonthlyRent);
  const illustrativeInvestReturnPct = investmentReturnRate;

  // Amortization schedules
  const amortizationSchedule = buildAmortization(loanAmount, interestRate, termMonths, 0, homePrice, appreciationRate);
  const amortizationWithExtra = buildAmortization(loanAmount, interestRate, termMonths, extraMonthlyPayment, homePrice, appreciationRate);

  const totalInterestStandard = amortizationSchedule.length > 0
    ? amortizationSchedule[amortizationSchedule.length - 1].totalInterestPaid : 0;
  const totalInterestWithExtra = amortizationWithExtra.length > 0
    ? amortizationWithExtra[amortizationWithExtra.length - 1].totalInterestPaid : 0;
  const interestSavings = totalInterestStandard - totalInterestWithExtra;

  const payoffMonthStandard = amortizationSchedule.length;
  const payoffMonthWithExtra = amortizationWithExtra.length;

  // Equity milestones — correct breakdown:
  // Total equity = downPayment + principalPaid + appreciationGain
  // principalPaid = loanAmount - currentBalance
  // appreciationGain = currentHomeValue - originalHomePrice
  const milestoneYears = [1, 3, 5, 10];
  const equityMilestones: EquityMilestone[] = milestoneYears.map(years => {
    const m = years * 12;
    const idx = Math.min(m - 1, amortizationSchedule.length - 1);
    const row = amortizationSchedule[idx];
    const rowExtra = amortizationWithExtra[Math.min(m - 1, amortizationWithExtra.length - 1)];

    const currentHomeValue = row ? row.homeValue : homePrice * Math.pow(1 + appreciationRate / 100 / 12, m);
    const currentBalance = row ? row.balance : loanAmount;
    const principalPaid = loanAmount - currentBalance;          // actual loan paydown
    const appreciationGainVal = currentHomeValue - homePrice;   // pure price appreciation
    // Total equity = down payment already paid + principal paid down + appreciation
    const totalEquity = downPaymentAmount + principalPaid + appreciationGainVal;

    return {
      years,
      equity: totalEquity,
      homeValue: currentHomeValue,
      loanBalance: currentBalance,
      equityPct: (totalEquity / currentHomeValue) * 100,
      equityWithExtra: rowExtra ? (downPaymentAmount + (loanAmount - rowExtra.balance) + (rowExtra.homeValue - homePrice)) : totalEquity,
      homeValueWithExtra: rowExtra ? rowExtra.homeValue : currentHomeValue,
      loanBalanceWithExtra: rowExtra ? rowExtra.balance : currentBalance,
      downPaymentAmount,
      principalPaid,
      appreciationGain: appreciationGainVal,
    };
  });

  // Net worth milestones (1, 5, 10, 30 years)
  const nwMilestoneYears = [1, 5, 10, 30];
  const netWorthMilestones: NetWorthMilestone[] = nwMilestoneYears.map(years => {
    const m = years * 12;
    const row = amortizationSchedule[Math.min(m - 1, amortizationSchedule.length - 1)];

    // Owner net worth = home equity (appreciation + principal paid + down payment) minus initial cash outlay
    const ownerHomeValue = row ? row.homeValue : homePrice * Math.pow(1 + appreciationRate / 100, years);
    const ownerLoanBalance = row ? row.balance : 0;
    const ownerEquity = downPaymentAmount + (loanAmount - ownerLoanBalance) + (ownerHomeValue - homePrice);
    const ownerNetWorth = ownerEquity - totalCashNeeded; // net of initial cash invested

    // Renter path: invest the monthly payment gap (buy − rent) in an S&P 500-like
    // portfolio at the illustrative annual return. Replaces the old renter = $0 model.
    // Housing equity from renting is still $0; this is a portfolio illustration only.
    const renterNetWorth = futureValueOfMonthlyContributions(
      monthlyInvestGap,
      years,
      illustrativeInvestReturnPct,
    );

    // Cumulative rent paid (with inflation)
    let cumulativeRent = 0;
    let currentRent = monthlyRent;
    for (let i = 0; i < m; i++) {
      if (i > 0 && i % 12 === 0) currentRent *= (1 + rentInflationRate / 100);
      cumulativeRent += currentRent;
    }

    const cumulativeMortgagePaid = row
      ? (row.payment * m) // approximate
      : monthlyMortgagePI * m;

    return {
      years,
      ownerNetWorth,
      renterNetWorth,
      ownerHomeValue,
      ownerLoanBalance,
      ownerEquity,
      renterSavings: renterNetWorth,
      cumulativeRentPaid: cumulativeRent,
      cumulativeMortgagePaid,
    };
  });

  const renterInvestYears = [1, 3, 5, 10];
  const renterInvestedMilestones: RenterInvestedMilestone[] = renterInvestYears.map(years => ({
    years,
    monthlyContribution: monthlyInvestGap,
    investedBalance: futureValueOfMonthlyContributions(
      monthlyInvestGap,
      years,
      illustrativeInvestReturnPct,
    ),
  }));

  // Lease break analysis
  const leaseBreakCost = monthlyRent * leaseBreakMonths;
  const homeValueInOneYear = homePrice * (1 + appreciationRate / 100);
  const priceIncreaseInOneYear = homeValueInOneYear - homePrice;
  const additionalDownNeeded = priceIncreaseInOneYear * (downPaymentPct / 100);
  const costOfWaitingOneYear = priceIncreaseInOneYear + (monthlyRent * 12) - (monthlyRent * 12); // net cost = price appreciation you miss
  const leaseBreakVsWait: 'break' | 'wait' = leaseBreakCost < priceIncreaseInOneYear ? 'break' : 'wait';

  // Savings race (12 months)
  const savingsRaceData = Array.from({ length: 25 }, (_, i) => {
    const month = (i + 1) * 3; // every 3 months, up to 72
    const savings = monthlySavingsAmount * month;
    const homeValueGain = homePrice * (Math.pow(1 + appreciationRate / 100 / 12, month) - 1);
    return { month, savings, homeValueGain, gap: homeValueGain - savings };
  });

  return {
    monthlyMortgagePI,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMaintenance,
    totalMonthlyOwnership,
    totalMonthlyRent,
    loanAmount,
    downPaymentAmount,
    closingCosts,
    totalCashNeeded,
    amortizationSchedule,
    amortizationWithExtra,
    totalInterestStandard,
    totalInterestWithExtra,
    interestSavings,
    payoffMonthStandard,
    payoffMonthWithExtra,
    payoffDateStandard: formatPayoffDate(payoffMonthStandard),
    payoffDateWithExtra: formatPayoffDate(payoffMonthWithExtra),
    equityMilestones,
    netWorthMilestones,
    monthlyInvestGap,
    renterInvestedMilestones,
    illustrativeInvestReturnPct,
    leaseBreakCost,
    costOfWaitingOneYear: priceIncreaseInOneYear,
    homeValueInOneYear,
    additionalDownNeeded,
    leaseBreakVsWait,
    savingsRaceData,
  };
}

interface CalculatorContextType {
  inputs: CalculatorInputs;
  derived: CalculatorDerived;
  setInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  resetInputs: () => void;
  rateLoading: boolean;
  rateFetched: boolean;
}

const CalculatorContext = createContext<CalculatorContextType | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [urlInputs] = useState(() =>
    typeof window !== 'undefined' ? parseCoreInputsFromSearch(window.location.search) : {},
  );
  const urlLockedRate = urlInputs.interestRate != null;
  const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS, ...urlInputs });
  const [rateLoading, setRateLoading] = useState(false);
  const [rateFetched, setRateFetched] = useState(false);

  const setInput = useCallback(<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetInputs = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  // Fetch latest mortgage rate from FRED API (no key required for observation endpoint).
  // Skip overwrite when the iframe/querystring already supplied `rate`.
  useEffect(() => {
    if (urlLockedRate) return;
    const fetchRate = async () => {
      setRateLoading(true);
      try {
        const res = await fetch(
          'https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US&vintage_date=2026-03-29'
        );
        if (res.ok) {
          const text = await res.text();
          const lines = text.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parts = lastLine.split(',');
          const rate = parseFloat(parts[1]);
          if (!isNaN(rate) && rate > 0) {
            setInputs(prev => ({ ...prev, interestRate: rate }));
            setRateFetched(true);
          }
        }
      } catch {
        // Silently fall back to default rate
      } finally {
        setRateLoading(false);
      }
    };
    fetchRate();
  }, [urlLockedRate]);

  const derived = useMemo(() => deriveCalculations(inputs), [inputs]);

  return (
    <CalculatorContext.Provider value={{ inputs, derived, setInput, resetInputs, rateLoading, rateFetched }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider');
  return ctx;
}
