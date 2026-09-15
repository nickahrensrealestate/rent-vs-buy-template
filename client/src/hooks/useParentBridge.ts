import { useCallback, useEffect, useMemo } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import {
  buildFocusFormMessage,
  buildStateMessage,
  isEmbedded,
  postToParent,
  readUtmFromSearch,
  syncQueryString,
  type RvoCalculatorState,
  type RvoIntent,
} from '@/lib/parentBridge';

const SYNC_DEBOUNCE_MS = 400;

function equityAt(
  milestones: { years: number; equity: number }[],
  years: number,
): number {
  return milestones.find(m => m.years === years)?.equity ?? 0;
}

function investedAt(
  milestones: { years: number; investedBalance: number }[],
  years: number,
): number {
  return milestones.find(m => m.years === years)?.investedBalance ?? 0;
}

export function useParentBridge() {
  const { inputs, derived } = useCalculator();

  const payload: RvoCalculatorState = useMemo(() => ({
    homePrice: inputs.homePrice,
    downPaymentPct: inputs.downPaymentPct,
    downPaymentAmount: derived.downPaymentAmount,
    rate: inputs.interestRate,
    rent: inputs.monthlyRent,
    hoa: inputs.hoaMonthly,
    taxRate: inputs.propertyTaxRate,
    appreciation: inputs.appreciationRate,
    monthlyBuy: derived.totalMonthlyOwnership,
    monthlyRent: derived.totalMonthlyRent,
    difference: derived.totalMonthlyOwnership - derived.totalMonthlyRent,
    equity1: equityAt(derived.equityMilestones, 1),
    equity3: equityAt(derived.equityMilestones, 3),
    equity5: equityAt(derived.equityMilestones, 5),
    equity10: equityAt(derived.equityMilestones, 10),
    renterInvested1: investedAt(derived.renterInvestedMilestones, 1),
    renterInvested3: investedAt(derived.renterInvestedMilestones, 3),
    renterInvested5: investedAt(derived.renterInvestedMilestones, 5),
    renterInvested10: investedAt(derived.renterInvestedMilestones, 10),
    utm: readUtmFromSearch(),
  }), [inputs, derived]);

  const sendState = useCallback((intent: RvoIntent = 'sync') => {
    postToParent(buildStateMessage(intent, payload));
    return payload;
  }, [payload]);

  const focusParentForm = useCallback((intent: RvoIntent = 'breakdown') => {
    postToParent(buildFocusFormMessage(intent, payload));
    postToParent(buildStateMessage(intent, payload));
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return payload;
  }, [payload]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      postToParent(buildStateMessage('sync', payload));
      syncQueryString(payload);
    }, SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [payload]);

  return { payload, sendState, focusParentForm, isEmbedded: isEmbedded() };
}
