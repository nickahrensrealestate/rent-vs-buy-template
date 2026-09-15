import { describe, expect, it } from 'vitest';
import {
  ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT,
  futureValueOfMonthlyContributions,
} from './compound';

describe('futureValueOfMonthlyContributions', () => {
  it('uses the labeled 7.5% illustrative S&P-like default', () => {
    expect(ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT).toBe(7.5);
  });

  it('returns 0 for a non-positive monthly contribution (no investable gap)', () => {
    expect(futureValueOfMonthlyContributions(0, 10)).toBe(0);
    expect(futureValueOfMonthlyContributions(-250, 10)).toBe(0);
    expect(futureValueOfMonthlyContributions(Number.NaN, 10)).toBe(0);
  });

  it('returns 0 for non-positive years', () => {
    expect(futureValueOfMonthlyContributions(100, 0)).toBe(0);
    expect(futureValueOfMonthlyContributions(100, -1)).toBe(0);
  });

  it('sums contributions with no growth at 0% return', () => {
    expect(futureValueOfMonthlyContributions(100, 1, 0)).toBe(1200);
    expect(futureValueOfMonthlyContributions(250, 10, 0)).toBe(30000);
  });

  it('compounds monthly at the 7.5% illustrative rate', () => {
    const monthly = 200;
    const years = 10;
    const r = 0.075 / 12;
    const n = years * 12;
    const expected = monthly * ((Math.pow(1 + r, n) - 1) / r);

    expect(futureValueOfMonthlyContributions(monthly, years)).toBeCloseTo(expected, 6);
    expect(futureValueOfMonthlyContributions(monthly, years, 7.5)).toBeCloseTo(expected, 6);
  });

  it('grows faster over longer horizons (1 < 3 < 5 < 10 years)', () => {
    const fv1 = futureValueOfMonthlyContributions(150, 1);
    const fv3 = futureValueOfMonthlyContributions(150, 3);
    const fv5 = futureValueOfMonthlyContributions(150, 5);
    const fv10 = futureValueOfMonthlyContributions(150, 10);

    expect(fv1).toBeGreaterThan(150 * 12);
    expect(fv3).toBeGreaterThan(fv1);
    expect(fv5).toBeGreaterThan(fv3);
    expect(fv10).toBeGreaterThan(fv5);
  });
});
