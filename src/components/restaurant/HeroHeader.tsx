import React from 'react';
import {
  ChefHat,
  ChevronRight,
  RotateCcw,
  Star,
  Users,
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../data/menuData';
import { useTableSession } from '../../context/TableSessionContext';

export const HeroHeader: React.FC = () => {
  const {
    tableNumber,
    activeGuests,
    orderRounds,
    setIsOrderTrackerOpen,
    setIsReviewOpen,
    resetDemoSession,
  } = useTableSession();

  const activeRound = orderRounds.find((r) => r.status !== 'Served');

  return (
    <header className="relative pt-5 pb-5 px-4 sm:px-6 md:px-8 border-b border-taupe bg-porcelain">
      {/* Top Utility Bar: Table Context & Reset Demo */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Table & Guests Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-taupe shadow-subtle">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-espresso">
            Table #{tableNumber}
          </span>
          <span className="text-stone">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-warm-grey">
            <Users className="w-3 h-3 text-stone" />
            <span className="tabular-nums font-semibold text-espresso">{activeGuests}</span>
            <span>Guests</span>
          </span>
        </div>

        {/* Reset Demo Session Button */}
        <button
          type="button"
          onClick={resetDemoSession}
          title="Reset table demo session"
          aria-label="Reset demo session"
          className="w-8 h-8 rounded-full bg-cream border border-taupe text-stone hover:text-espresso hover:border-warm-grey active:scale-95 transition-all flex items-center justify-center shadow-subtle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editorial Restaurant Title & Subtitle */}
      <div>
        <h1 className="font-serif text-[40px] sm:text-[46px] md:text-[52px] font-medium tracking-[0.14em] text-espresso leading-none">
          {RESTAURANT_CONFIG.name}
        </h1>
        <p className="text-[11px] font-bold tracking-[0.34em] uppercase text-warm-grey mt-2">
          {RESTAURANT_CONFIG.subtitle}
        </p>
      </div>

      {/* Refined Metadata Strip: Rating + Location + Tier */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-3 text-[12px] text-warm-grey">
        {/* Rating Trigger */}
        <button
          type="button"
          onClick={() => setIsReviewOpen(true)}
          className="inline-flex items-center gap-1 text-[12px] text-espresso hover:text-olive transition-colors group"
        >
          <Star className="w-3.5 h-3.5 fill-brass text-brass shrink-0" />
          <span className="font-bold tabular-nums">{RESTAURANT_CONFIG.rating}</span>
          <span className="text-stone">({RESTAURANT_CONFIG.reviewCount})</span>
        </button>

        <span className="text-taupe">•</span>

        <span>{RESTAURANT_CONFIG.location}</span>

        <span className="text-taupe">•</span>

        <span className="font-semibold uppercase tracking-wider text-[10.5px] text-brass-dark">
          {RESTAURANT_CONFIG.tier}
        </span>
      </div>

      {/* Compact Kitchen Status Pill */}
      <div className="mt-3.5">
        <button
          type="button"
          onClick={() => setIsOrderTrackerOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-taupe hover:border-olive/50 text-[11.5px] text-espresso transition-all shadow-subtle group active:scale-[0.98]"
        >
          <ChefHat
            className={`w-3.5 h-3.5 ${
              activeRound ? 'text-olive' : 'text-forest'
            }`}
          />
          <span className="font-medium">
            {activeRound
              ? `Round ${activeRound.roundNumber} • ${activeRound.status}`
              : `${orderRounds.length} ${
                  orderRounds.length === 1 ? 'Round' : 'Rounds'
                } Served`}
          </span>
          <span className="text-stone">•</span>
          <span className="text-olive font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
            Track Kitchen
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </button>
      </div>
    </header>
  );
};
