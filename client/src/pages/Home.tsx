/**
 * Home Page — Denver Rent vs. Buy Calculator
 * Precision Ledger Design System
 *
 * Layout: Sticky left sidebar (inputs) + scrollable right content
 * Sections: Hero → 01 Monthly Cost → 02 Amortization → 03 Equity →
 *           04 Net Worth → 05 Lease Break → 06 Savings Race →
 *           07 Opportunity Cost → 08 Tax Benefit → 09 True Cost of Renting
 */

import { useState, useEffect } from 'react';
import InputsPanel from '@/components/InputsPanel';
import MonthlyCostSection from '@/components/sections/MonthlyCostSection';
import AmortizationSection from '@/components/sections/AmortizationSection';
import EquitySection from '@/components/sections/EquitySection';
import NetWorthSection from '@/components/sections/NetWorthSection';
import LeaseBreakSection from '@/components/sections/LeaseBreakSection';
import SavingsRaceSection from '@/components/sections/SavingsRaceSection';
import { OpportunityCostSection, TaxBenefitSection, TrueCostRentingSection } from '@/components/sections/BonusSections';
import { Menu, X, ChevronRight, BarChart2, Home as HomeIcon, TrendingUp, DollarSign, Clock, Zap, PiggyBank, FileText, List } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'monthly-cost', label: 'Monthly Cost', number: '01' },
  { id: 'amortization', label: 'Amortization', number: '02' },
  { id: 'equity', label: 'Equity Position', number: '03' },
  { id: 'net-worth', label: 'Net Worth', number: '04' },
  { id: 'lease-break', label: 'Lease Break', number: '05' },
  { id: 'savings-race', label: 'Savings Race', number: '06' },
  { id: 'opportunity-cost', label: 'Opportunity Cost', number: '07' },
  { id: 'tax-benefit', label: 'Tax Benefit', number: '08' },
  { id: 'true-cost-renting', label: 'True Cost of Renting', number: '09' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('monthly-cost');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 navy-bg rounded flex items-center justify-center flex-shrink-0">
              <HomeIcon size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-700 text-gray-900 leading-tight">Denver Rent vs. Buy</p>
              <p className="text-xs text-gray-400 leading-tight">Financial Calculator</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="font-mono-data text-gray-400 mr-1">{item.number}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-2 px-4">
            <div className="grid grid-cols-2 gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { scrollTo(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-left transition-colors ${
                    activeSection === item.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-mono-data text-gray-400">{item.number}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Inputs sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <InputsPanel />
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero section */}
          <div
            className="relative overflow-hidden"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663295241406/nHumi3rEjGERgetXB6mEiu/hero-denver-skyline-hwpdj5LeReN9h9qCRidqm2.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/40" />
            <div className="relative z-10 px-8 py-16 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/30 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-200 text-xs font-medium">Denver Metro Area · 2026</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-800 text-white leading-tight mb-4">
                Rent vs. Buy<br />
                <span className="text-blue-300">Financial Calculator</span>
              </h1>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                Make the most important financial decision of your life with real numbers. Adjust the sliders to match your situation and see every angle of the rent vs. buy decision.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => scrollTo('monthly-cost')}
                  className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded font-display font-600 text-sm hover:bg-gray-100 transition-colors"
                >
                  Start Calculating <ChevronRight size={15} />
                </button>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2.5 rounded text-white text-sm">
                  <span className="font-mono-data font-600">9</span>
                  <span className="text-gray-300">interactive sections</span>
                </div>
              </div>
            </div>

            {/* Hero stats */}
            <div className="relative z-10 flex flex-wrap gap-4 px-8 pb-8">
              {[
                { label: 'Denver Median Price', value: '$565K', sub: 'Feb 2026' },
                { label: 'Avg Appreciation', value: '3%/yr', sub: 'Denver Metro' },
                { label: 'Current Rate', value: '6.38%', sub: '30-yr fixed' },
                { label: 'Avg HOA', value: '$150/mo', sub: 'Denver Metro' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 border border-white/20 rounded px-4 py-2 backdrop-blur-sm">
                  <p className="font-mono-data text-white font-700 text-base">{stat.value}</p>
                  <p className="text-gray-300 text-xs">{stat.label}</p>
                  <p className="text-gray-400 text-xs">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile inputs panel */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer font-display text-sm font-600 text-gray-800">
                <span>Adjust Your Numbers</span>
                <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-4">
                <InputsPanel />
              </div>
            </details>
          </div>

          {/* All sections */}
          <div className="px-6 md:px-8 max-w-5xl">
            <MonthlyCostSection />
            <AmortizationSection />
            <EquitySection />
            <NetWorthSection />
            <LeaseBreakSection />
            <SavingsRaceSection />
            <OpportunityCostSection />
            <TaxBenefitSection />
            <TrueCostRentingSection />

            {/* Footer */}
            <footer className="py-12 mt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 navy-bg rounded flex items-center justify-center">
                    <HomeIcon size={11} className="text-white" />
                  </div>
                    <span className="font-display text-sm font-700 text-gray-800">Denver Rent vs. Buy Calculator</span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                    This tool is for educational and illustrative purposes only. All calculations are estimates based on the inputs provided. Consult a licensed mortgage professional, financial advisor, and/or CPA before making real estate or financial decisions.
                  </p>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  <p>Denver Metro defaults based on</p>
                  <p>Freddie Mac, Redfin, Colorado CAR</p>
                  <p>data as of early 2026.</p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
