/**
 * Parent-page bridge for the Squarespace embed.
 *
 * The calculator posts JSON to window.parent so the host page can:
 *   1. Sticky-scroll to the lead form (`rvo:focus-form`)
 *   2. Map calculator fields into a Squarespace form / webhook (`rvo:state`)
 *
 * Also mirrors core inputs onto the iframe querystring (replaceState) so a
 * parent or Nick can read state without listening to postMessage.
 */

export const RVO_SOURCE = 'rent-vs-buy';
export const RVO_STATE_EVENT = 'rvo:state';
export const RVO_FOCUS_FORM_EVENT = 'rvo:focus-form';
export const RVO_FOCUS_FORM_PROTOCOL = '?focus=form';

export type RvoIntent = 'breakdown' | 'watching' | 'sync';

export interface RvoUtm {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/** Payload posted to the parent page and optionally mirrored in the querystring. */
export interface RvoCalculatorState {
  homePrice: number;
  downPaymentPct: number;
  downPaymentAmount: number;
  rate: number;
  rent: number;
  hoa: number;
  taxRate: number;
  appreciation: number;
  monthlyBuy: number;
  monthlyRent: number;
  difference: number;
  equity1: number;
  equity3: number;
  equity5: number;
  equity10: number;
  renterInvested1: number;
  renterInvested3: number;
  renterInvested5: number;
  renterInvested10: number;
  utm: RvoUtm;
}

export interface RvoStateMessage {
  source: typeof RVO_SOURCE;
  type: typeof RVO_STATE_EVENT;
  intent: RvoIntent;
  payload: RvoCalculatorState;
}

export interface RvoFocusFormMessage {
  source: typeof RVO_SOURCE;
  type: typeof RVO_FOCUS_FORM_EVENT;
  intent: RvoIntent;
  protocol: typeof RVO_FOCUS_FORM_PROTOCOL;
  payload: RvoCalculatorState;
}

export type RvoParentMessage = RvoStateMessage | RvoFocusFormMessage;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

const QUERY_INPUT_KEYS = {
  homePrice: 'homePrice',
  downPaymentPct: 'downPaymentPct',
  rate: 'interestRate',
  rent: 'monthlyRent',
  hoa: 'hoaMonthly',
  taxRate: 'propertyTaxRate',
  appreciation: 'appreciationRate',
} as const;

export interface ParsedCoreInputs {
  homePrice?: number;
  downPaymentPct?: number;
  interestRate?: number;
  monthlyRent?: number;
  hoaMonthly?: number;
  propertyTaxRate?: number;
  appreciationRate?: number;
}

function roundMoney(n: number): number {
  return Math.round(n);
}

function roundPct(n: number): number {
  return Math.round(n * 100) / 100;
}

export function readUtmFromSearch(search: string = typeof window !== 'undefined' ? window.location.search : ''): RvoUtm {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const utm: RvoUtm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

export function parseCoreInputsFromSearch(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): ParsedCoreInputs {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const next: ParsedCoreInputs = {};

  const read = (queryKey: string): number | undefined => {
    const raw = params.get(queryKey);
    if (raw == null || raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const homePrice = read('homePrice');
  const downPaymentPct = read('downPaymentPct');
  const interestRate = read('rate');
  const monthlyRent = read('rent');
  const hoaMonthly = read('hoa');
  const propertyTaxRate = read('taxRate');
  const appreciationRate = read('appreciation');

  if (homePrice != null) next.homePrice = homePrice;
  if (downPaymentPct != null) next.downPaymentPct = downPaymentPct;
  if (interestRate != null) next.interestRate = interestRate;
  if (monthlyRent != null) next.monthlyRent = monthlyRent;
  if (hoaMonthly != null) next.hoaMonthly = hoaMonthly;
  if (propertyTaxRate != null) next.propertyTaxRate = propertyTaxRate;
  if (appreciationRate != null) next.appreciationRate = appreciationRate;

  return next;
}

export function parentOrigin(): string {
  try {
    if (typeof document !== 'undefined' && document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch {
    // ignore malformed referrer
  }
  return '*';
}

export function isEmbedded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.parent !== window;
  } catch {
    return true;
  }
}

export function postToParent(message: RvoParentMessage): void {
  if (typeof window === 'undefined') return;
  const origin = parentOrigin();
  try {
    window.parent?.postMessage(message, origin);
    if (window.top && window.top !== window.parent) {
      window.top.postMessage(message, origin);
    }
  } catch {
    window.parent?.postMessage(message, '*');
  }
}

export function syncQueryString(state: RvoCalculatorState): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  url.searchParams.set('homePrice', String(roundMoney(state.homePrice)));
  url.searchParams.set('downPaymentPct', String(roundPct(state.downPaymentPct)));
  url.searchParams.set('rate', String(roundPct(state.rate)));
  url.searchParams.set('rent', String(roundMoney(state.rent)));
  url.searchParams.set('hoa', String(roundMoney(state.hoa)));
  url.searchParams.set('taxRate', String(roundPct(state.taxRate)));
  url.searchParams.set('appreciation', String(roundPct(state.appreciation)));
  url.searchParams.set('monthlyBuy', String(roundMoney(state.monthlyBuy)));
  url.searchParams.set('monthlyRent', String(roundMoney(state.monthlyRent)));
  url.searchParams.set('difference', String(roundMoney(state.difference)));
  url.searchParams.set('equity1', String(roundMoney(state.equity1)));
  url.searchParams.set('equity3', String(roundMoney(state.equity3)));
  url.searchParams.set('equity5', String(roundMoney(state.equity5)));
  url.searchParams.set('equity10', String(roundMoney(state.equity10)));

  for (const key of UTM_KEYS) {
    const value = state.utm[key];
    if (value) url.searchParams.set(key, value);
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState({}, '', next);
  }
}

export function buildStateMessage(intent: RvoIntent, payload: RvoCalculatorState): RvoStateMessage {
  return { source: RVO_SOURCE, type: RVO_STATE_EVENT, intent, payload };
}

export function buildFocusFormMessage(intent: RvoIntent, payload: RvoCalculatorState): RvoFocusFormMessage {
  return {
    source: RVO_SOURCE,
    type: RVO_FOCUS_FORM_EVENT,
    intent,
    protocol: RVO_FOCUS_FORM_PROTOCOL,
    payload,
  };
}

export { QUERY_INPUT_KEYS };
