import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { formatINR } from '../../lib/pricing';

export const FloatingBottomDock: React.FC = () => {
  const {
    cart,
    orderRounds,
    billSummary,
    fireOrderToKitchen,
    setIsCheckoutOpen,
    isFiringOrder,
  } = useTableSession();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg md:max-w-xl px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="pointer-events-auto bg-[#FCFAF6] border border-[#DED8CE] rounded-2xl p-3 sm:p-3.5 shadow-[0_12px_36px_-6px_rgba(41,37,31,0.16)] space-y-2.5">
        {/* Active Cart CTA (When selections are added) */}
        <AnimatePresence initial={false}>
          {cartItemCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                disabled={isFiringOrder}
                data-testid="fire-to-kitchen-btn"
                onClick={fireOrderToKitchen}
                className="w-full h-11 sm:h-12 px-4 rounded-xl bg-olive hover:bg-olive-hover text-cream shadow-subtle flex items-center justify-between font-semibold active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-cream/15 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                  </span>
                  <div className="text-left min-w-0">
                    <p className="text-[12.5px] font-semibold leading-tight truncate">
                      Fire {cartItemCount}{' '}
                      {cartItemCount === 1 ? 'Selection' : 'Selections'} to Kitchen
                    </p>
                    <p className="text-[10px] text-cream/75 leading-tight truncate">
                      Round {orderRounds.length + 1} • Instant Kitchen Dispatch
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    data-testid="active-cart-total"
                    className="text-[14px] sm:text-[15px] font-bold tabular-nums"
                  >
                    {formatINR(cartSubtotal)}
                  </span>
                  <ChevronRight className="w-4 h-4 stroke-[2]" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Table Bill: Responsive Flex Container */}
        {/* Mobile (< 600px): Vertical stack (bill summary top, full-width button bottom) */}
        {/* Desktop / Tablet (≥ 600px): Side-by-side horizontal row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 px-0.5">
          {/* Bill Summary Trigger */}
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full sm:w-auto sm:flex-1 flex items-center justify-between sm:block text-left group py-0.5 transition-opacity hover:opacity-90 active:opacity-75"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone leading-none">
                Table Bill
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  data-testid="dock-live-bill-amount"
                  className="text-[20px] sm:text-[22px] font-bold tabular-nums text-espresso leading-none"
                >
                  {formatINR(billSummary.remainingBalance)}
                </span>
                <span className="text-[11px] font-medium text-warm-grey whitespace-nowrap leading-none shrink-0">
                  {billSummary.remainingBalance === 0
                    ? 'Settled'
                    : 'incl. 5% GST'}
                </span>
              </div>
            </div>

            {/* Mobile-only statement indicator */}
            <span className="sm:hidden text-[11px] font-medium text-warm-grey group-hover:text-espresso flex items-center gap-0.5 transition-colors shrink-0">
              <span>Statement</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone group-hover:text-espresso transition-colors" />
            </span>
          </button>

          {/* Pay / Split Bill CTA: Full-width on mobile (< 600px), auto-width on desktop (≥ 600px) */}
          <button
            type="button"
            data-testid="open-checkout-btn"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full sm:w-auto sm:shrink-0 h-11 px-5 rounded-xl bg-olive hover:bg-olive-hover text-cream text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-subtle whitespace-nowrap active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4 text-brass shrink-0" />
            <span>
              {billSummary.remainingBalance === 0
                ? 'View Statement & Receipt'
                : 'Pay / Split Bill'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
