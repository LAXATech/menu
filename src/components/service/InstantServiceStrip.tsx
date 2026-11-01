import React from 'react';
import { ConciergeBell, Droplets, Sparkles, Check } from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { ServiceType } from '../../types';

const SERVICE_ITEMS: {
  type: ServiceType;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    type: 'water',
    label: 'Water',
    shortDesc: 'Still / Sparkling',
    icon: Droplets,
  },
  {
    type: 'waiter',
    label: 'Call Waiter',
    shortDesc: 'Table Captain',
    icon: ConciergeBell,
  },
  {
    type: 'napkins',
    label: 'Napkins',
    shortDesc: 'Fresh Linen',
    icon: Sparkles,
  },
];

export const InstantServiceStrip: React.FC = () => {
  const { services, triggerServiceRequest } = useTableSession();

  return (
    <section
      aria-label="Instant Table Concierge"
      className="px-4 sm:px-6 md:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-6 pb-2 bg-porcelain"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
          Table Concierge
        </span>
        <span className="text-[11px] text-warm-grey">
          One-tap silent service
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {SERVICE_ITEMS.map(({ type, label, shortDesc, icon: Icon }) => {
          const state = services[type];
          const isCoolingDown =
            Boolean(state.activeUntil) && state.remainingSeconds > 0;

          return (
            <button
              key={type}
              type="button"
              disabled={isCoolingDown}
              onClick={() => triggerServiceRequest(type)}
              data-testid={`service-btn-${type}`}
              className={`relative min-h-[60px] sm:min-h-[68px] rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 text-left transition-all duration-200 flex flex-col justify-between border ${
                isCoolingDown
                  ? 'bg-olive/10 border-olive/30 text-espresso cursor-not-allowed shadow-subtle'
                  : 'bg-cream hover:bg-ivory/60 border-taupe shadow-subtle active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isCoolingDown
                      ? 'bg-olive text-cream'
                      : 'bg-taupe/30 text-olive'
                  }`}
                >
                  {isCoolingDown ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                  )}
                </div>

                {isCoolingDown && (
                  <span
                    data-testid={`service-cooldown-${type}`}
                    className="text-[10px] font-bold tabular-nums text-forest bg-forest/10 px-1.5 py-0.5 rounded-md"
                  >
                    {state.remainingSeconds}s
                  </span>
                )}
              </div>

              <div className="mt-1.5">
                <p className="text-[11.5px] sm:text-[12.5px] font-semibold leading-tight text-espresso truncate">
                  {isCoolingDown ? 'Requested' : label}
                </p>
                <p className="text-[9.5px] sm:text-[10px] text-warm-grey leading-tight mt-0.5 truncate hidden xs:block sm:block">
                  {shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
