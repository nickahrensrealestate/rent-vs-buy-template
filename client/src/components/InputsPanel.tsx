/**
 * InputsPanel — Precision Ledger Design System
 * Sticky left sidebar with all master input sliders.
 * All values flow to CalculatorContext and update all sections in real-time.
 */

import { useCalculator } from '@/contexts/CalculatorContext';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, ChevronDown, ChevronUp, Home, DollarSign, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
  highlight?: boolean;
}

function SliderRow({ label, value, min, max, step, format, onChange, hint, highlight }: SliderRowProps) {
  return (
    <div className={`space-y-1.5 ${highlight ? 'bg-blue-50 -mx-4 px-4 py-2 rounded' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="slider-label">{label}</span>
        <span className={`font-mono-data text-sm font-semibold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
          {format(value)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      {hint && <p className="text-xs text-gray-400 leading-tight">{hint}</p>}
    </div>
  );
}

interface SectionGroupProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function SectionGroup({ title, icon, defaultOpen = true, children }: SectionGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{icon}</span>
          <span className="font-display text-xs font-700 uppercase tracking-wider text-gray-700 group-hover:text-gray-900 transition-colors">
            {title}
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

export default function InputsPanel() {
  const { inputs, setInput, rateLoading, rateFetched } = useCalculator();

  return (
    <aside className="inputs-sidebar bg-white border-r border-gray-100 w-72 flex-shrink-0">
      {/* Panel header */}
      <div className="navy-bg px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-blue-400 rounded flex items-center justify-center">
            <Home size={13} className="text-white" />
          </div>
          <span className="font-display text-white font-semibold text-sm">Your Numbers</span>
        </div>
        <p className="text-blue-200 text-xs leading-tight">
          Adjust sliders to see real-time calculations across all sections below.
        </p>
      </div>

      {/* Rate fetch status */}
      <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        {rateLoading ? (
          <>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Fetching live rate…</span>
          </>
        ) : rateFetched ? (
          <>
            <Wifi size={12} className="text-green-600" />
            <span className="text-xs text-green-700 font-medium">Live rate loaded</span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">Using default rate</span>
          </>
        )}
      </div>

      <div className="px-5 py-4 space-y-0">
        {/* Purchase */}
        <SectionGroup title="Purchase" icon={<Home size={13} />} defaultOpen={true}>
          <SliderRow
            label="Home Price"
            value={inputs.homePrice}
            min={200000} max={1500000} step={5000}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('homePrice', v)}
            hint="Denver Metro median: ~$565K"
          />
          <SliderRow
            label="Down Payment"
            value={inputs.downPaymentPct}
            min={3} max={50} step={0.5}
            format={v => `${v}% (${formatCurrency(inputs.homePrice * v / 100, 0)})`}
            onChange={v => setInput('downPaymentPct', v)}
          />
          <SliderRow
            label="Interest Rate"
            value={inputs.interestRate}
            min={3} max={12} step={0.05}
            format={v => formatPercent(v, 2)}
            onChange={v => setInput('interestRate', v)}
            highlight={rateFetched}
            hint={rateFetched ? 'Auto-fetched from Freddie Mac' : 'Freddie Mac 30-yr avg'}
          />
          <SliderRow
            label="Loan Term"
            value={inputs.loanTermYears}
            min={10} max={30} step={5}
            format={v => `${v} years`}
            onChange={v => setInput('loanTermYears', v)}
          />
          <SliderRow
            label="Property Tax"
            value={inputs.propertyTaxRate}
            min={0.1} max={2.5} step={0.05}
            format={v => `${v}% / yr`}
            onChange={v => setInput('propertyTaxRate', v)}
            hint="CO effective rate: ~0.50%"
          />
          <SliderRow
            label="HOA Monthly"
            value={inputs.hoaMonthly}
            min={0} max={800} step={25}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('hoaMonthly', v)}
            hint="Denver median: ~$150/mo"
          />
          <SliderRow
            label="Home Insurance"
            value={inputs.homeInsuranceRate}
            min={0.1} max={2} step={0.05}
            format={v => `${v}% / yr`}
            onChange={v => setInput('homeInsuranceRate', v)}
          />
          <SliderRow
            label="Maintenance"
            value={inputs.maintenanceRate}
            min={0.5} max={3} step={0.1}
            format={v => `${v}% / yr`}
            onChange={v => setInput('maintenanceRate', v)}
            hint="Rule of thumb: 1% of home value"
          />
          <SliderRow
            label="Closing Costs"
            value={inputs.closingCostPct}
            min={1} max={6} step={0.25}
            format={v => `${v}% (${formatCurrency(inputs.homePrice * v / 100, 0)})`}
            onChange={v => setInput('closingCostPct', v)}
            hint="CO average: ~2.5%"
          />
        </SectionGroup>

        {/* Rent */}
        <SectionGroup title="Renting" icon={<DollarSign size={13} />} defaultOpen={true}>
          <SliderRow
            label="Monthly Rent"
            value={inputs.monthlyRent}
            min={800} max={6000} step={50}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('monthlyRent', v)}
            hint="Denver Metro median: ~$2,200"
          />
          <SliderRow
            label="Rent Inflation"
            value={inputs.rentInflationRate}
            min={0} max={8} step={0.25}
            format={v => `${v}% / yr`}
            onChange={v => setInput('rentInflationRate', v)}
            hint="Denver avg: ~3% / yr"
          />
          <SliderRow
            label="Renter's Insurance"
            value={inputs.renterInsurance}
            min={0} max={100} step={5}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('renterInsurance', v)}
          />
        </SectionGroup>

        {/* Growth & Returns */}
        <SectionGroup title="Growth & Returns" icon={<TrendingUp size={13} />} defaultOpen={false}>
          <SliderRow
            label="Home Appreciation"
            value={inputs.appreciationRate}
            min={0} max={10} step={0.25}
            format={v => `${v}% / yr`}
            onChange={v => setInput('appreciationRate', v)}
            hint="Denver Metro avg: 3% / yr"
          />
          <SliderRow
            label="Investment Return"
            value={inputs.investmentReturnRate}
            min={2} max={15} step={0.25}
            format={v => `${v}% / yr`}
            onChange={v => setInput('investmentReturnRate', v)}
            hint="S&P 500 hist. avg: ~7% real"
          />
        </SectionGroup>

        {/* Extra Payment */}
        <SectionGroup title="Extra Payment" icon={<DollarSign size={13} />} defaultOpen={false}>
          <SliderRow
            label="Extra Monthly Payment"
            value={inputs.extraMonthlyPayment}
            min={0} max={3000} step={50}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('extraMonthlyPayment', v)}
            hint="Applied directly to principal"
          />
        </SectionGroup>

        {/* Lease Break */}
        <SectionGroup title="Lease Break" icon={<Home size={13} />} defaultOpen={false}>
          <SliderRow
            label="Lease Break Fee"
            value={inputs.leaseBreakMonths}
            min={0} max={6} step={0.5}
            format={v => `${v} months rent`}
            onChange={v => setInput('leaseBreakMonths', v)}
            hint="Typical: 1–2 months rent"
          />
        </SectionGroup>

        {/* Savings Race */}
        <SectionGroup title="Savings Race" icon={<TrendingUp size={13} />} defaultOpen={false}>
          <SliderRow
            label="Monthly Savings"
            value={inputs.monthlySavingsAmount}
            min={100} max={5000} step={100}
            format={v => formatCurrency(v, 0)}
            onChange={v => setInput('monthlySavingsAmount', v)}
            hint="How much can you save per month?"
          />
        </SectionGroup>
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          * Calculations are estimates for educational purposes. Consult a licensed mortgage professional before making decisions.
        </p>
      </div>
    </aside>
  );
}
