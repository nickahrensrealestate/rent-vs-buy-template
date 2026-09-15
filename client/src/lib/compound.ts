/**
 * Illustrative compounding helpers for the rent-vs-buy “invest the gap” path.
 *
 * The 7.5% annual figure is an S&P 500-like long-run assumption used only for
 * illustration. It is not a forecast, guarantee, or investment advice.
 */

/** Labeled S&P 500-like illustrative annual return (not advice). */
export const ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT = 7.5;

/**
 * Future value of an ordinary annuity: a fixed contribution at the end of
 * each month, compounded monthly.
 *
 * Returns 0 when the contribution is missing, zero, or negative (e.g. rent
 * already costs more than buying, so there is no investable monthly gap).
 */
export function futureValueOfMonthlyContributions(
  monthlyContribution: number,
  years: number,
  annualReturnPct: number = ILLUSTRATIVE_SP500_ANNUAL_RETURN_PCT,
): number {
  if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) return 0;
  if (!Number.isFinite(years) || years <= 0) return 0;
  if (!Number.isFinite(annualReturnPct)) return 0;

  const months = years * 12;
  const monthlyRate = annualReturnPct / 100 / 12;

  if (monthlyRate === 0) return monthlyContribution * months;

  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}
