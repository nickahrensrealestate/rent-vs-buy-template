import { Mail } from 'lucide-react';

export default function HeroPromise() {
  return (
    <section
      className="bg-blue-600 text-white px-5 py-5 sm:py-6"
      aria-label="What this calculator does"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 mb-1.5">
          Rent vs. own · personal numbers
        </p>
        <h1 className="font-bold text-xl sm:text-2xl leading-snug mb-2">
          Adjust the numbers. Get a personal breakdown.
        </h1>
        <p className="text-sm sm:text-base text-blue-50 max-w-2xl leading-relaxed">
          Move the sliders to match your rent and a home you&apos;re considering.
          We&apos;ll show your equity over time — then you can send Nick these numbers
          so he can follow up with a breakdown for your situation, not a generic chart.
        </p>
      </div>
    </section>
  );
}

export function LeadCtaBlock({
  onBreakdown,
  onWatching,
}: {
  onBreakdown: () => void;
  onWatching: () => void;
}) {
  return (
    <section
      id="lead-form"
      className="scroll-mt-16 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Send me my breakdown</h2>
          <p className="text-sm text-gray-600 mt-1">
            Nick will use the numbers you just set — rent, price, rate, and equity —
            so the follow-up matches your situation. If you&apos;re on the Anthem page,
            this jumps to the form below the calculator.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBreakdown}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base rounded-xl px-5 py-3.5 shadow-sm transition-colors"
        >
          Send me my breakdown
        </button>
        <button
          type="button"
          onClick={onWatching}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm sm:text-base rounded-xl px-5 py-3.5 border border-gray-300 transition-colors"
        >
          Email me a copy / I&apos;m just watching
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Just browsing is fine — the watching option still saves these numbers for a lighter follow-up.
      </p>
    </section>
  );
}

export function StickyCtaBar({
  visible,
  onBreakdown,
}: {
  visible: boolean;
  onBreakdown: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-blue-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_12px_rgba(15,23,42,0.08)]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">
          Ready for a personal breakdown of these numbers?
        </p>
        <button
          type="button"
          onClick={onBreakdown}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg px-4 py-2.5 transition-colors"
        >
          Send me my breakdown
        </button>
      </div>
    </div>
  );
}
