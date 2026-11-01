import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { OrderStatus } from '../../types';
import { formatINR } from '../../lib/pricing';

const STATUS_STEPS: OrderStatus[] = [
  'Queued',
  'Chef Preparing',
  'Ready to Serve',
  'Served',
];

export const OrderTrackerModal: React.FC = () => {
  const {
    tableNumber,
    orderRounds,
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    isFiringOrder,
    lastFiredRound,
    advanceRoundStatus,
    setIsCheckoutOpen,
  } = useTableSession();

  return (
    <>
      {/* Full-Screen Fire Order Overlay */}
      <AnimatePresence>
        {isFiringOrder && (
          <motion.div
            key="fire-order-overlay"
            data-testid="fire-order-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: 'rgba(245, 242, 236, 0.98)' }}
            className="fixed inset-0 z-[70] bg-porcelain flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-16 h-16 rounded-2xl bg-olive shadow-subtle flex items-center justify-center mb-5 text-cream"
            >
              <Utensils className="w-8 h-8 stroke-[1.75]" />
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-[30px] font-medium text-espresso"
            >
              Order Fired to Kitchen
            </motion.h2>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="text-[13px] font-semibold text-olive mt-1.5 tracking-wider uppercase"
            >
              Preparing for Table #{tableNumber}
            </motion.p>

            {lastFiredRound && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
                className="text-[12px] text-warm-grey mt-2"
              >
                Round {lastFiredRound.roundNumber} •{' '}
                {lastFiredRound.items.reduce((s, i) => s + i.quantity, 0)}{' '}
                selections dispatched to kitchen
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kitchen Order Status Drawer */}
      <AnimatePresence>
        {isOrderTrackerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Live Kitchen Order Tracker"
            data-testid="order-tracker-modal"
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderTrackerOpen(false)}
              className="fixed inset-0 bg-[#29251F]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              style={{ backgroundColor: '#FCFAF6' }}
              className="relative z-10 w-full max-w-[480px] md:max-w-[580px] max-h-[88dvh] md:max-h-[85vh] flex flex-col rounded-t-[28px] md:rounded-2xl bg-cream border border-taupe shadow-2xl overflow-hidden"
            >
              <div className="w-10 h-1 rounded-full bg-taupe mx-auto mt-3 mb-1 shrink-0 md:hidden" />

              {/* Header */}
              <div
                style={{ backgroundColor: '#FCFAF6' }}
                className="px-5 sm:px-6 py-3.5 border-b border-taupe flex items-center justify-between bg-cream"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass-dark">
                    Kitchen Status
                  </span>
                  <h2 className="font-serif text-[21px] sm:text-[23px] font-medium text-espresso mt-0.5">
                    Table #{tableNumber} Order Rounds
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close kitchen tracker"
                  data-testid="close-order-tracker"
                  onClick={() => setIsOrderTrackerOpen(false)}
                  className="w-8 h-8 rounded-full bg-ivory hover:bg-taupe/40 border border-taupe flex items-center justify-center text-warm-grey hover:text-espresso transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rounds List */}
              <div
                style={{ backgroundColor: '#FCFAF6' }}
                className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar bg-cream"
              >
                {[...orderRounds].reverse().map((round) => {
                  const currentStepIndex = STATUS_STEPS.indexOf(round.status);

                  return (
                    <div
                      key={round.id}
                      data-testid={`tracker-round-${round.roundNumber}`}
                      className="bg-porcelain rounded-xl p-4 border border-taupe shadow-subtle space-y-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-ivory border border-taupe text-espresso text-[11px] font-bold uppercase tracking-wider">
                            Round {round.roundNumber}
                          </span>
                          <span className="text-[11.5px] text-warm-grey flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 text-stone" />
                            {round.firedAt}
                          </span>
                        </div>

                        <span
                          data-testid={`round-${round.roundNumber}-status`}
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            round.status === 'Served'
                              ? 'bg-forest/10 text-forest'
                              : 'bg-brass/15 text-brass-dark'
                          }`}
                        >
                          {round.status}
                        </span>
                      </div>

                      {/* 4-Stage Status Stepper */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;

                          return (
                            <button
                              key={step}
                              type="button"
                              onClick={() => advanceRoundStatus(round.id, step)}
                              title={`Simulate "${step}" status`}
                              className="text-left group focus:outline-none"
                            >
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  isCompleted
                                    ? round.status === 'Served'
                                      ? 'bg-forest'
                                      : 'bg-olive'
                                    : 'bg-taupe group-hover:bg-warm-grey/30'
                                }`}
                              />
                              <p
                                className={`text-[9.5px] mt-1.5 font-medium leading-tight ${
                                  isCompleted
                                    ? 'text-espresso font-semibold'
                                    : 'text-stone'
                                }`}
                              >
                                {step}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Items in Round */}
                      <div className="pt-2 border-t border-taupe/60 space-y-2">
                        {round.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-2 text-[12.5px]"
                          >
                            <div className="min-w-0">
                              <p className="text-espresso font-medium">
                                <span className="font-bold tabular-nums mr-1.5">
                                  {item.quantity}×
                                </span>
                                {item.name}
                              </p>
                              <p className="text-[10.5px] text-warm-grey">
                                {item.customization.portion} •{' '}
                                {item.customization.spice} Spice
                                {item.customization.addOns.length > 0 &&
                                  ` • +${item.customization.addOns
                                    .map((a) => a.name)
                                    .join(', ')}`}
                              </p>
                              {item.customization.instructions && (
                                <p className="text-[10.5px] italic text-stone">
                                  &ldquo;{item.customization.instructions}&rdquo;
                                </p>
                              )}
                            </div>

                            <span className="text-[12.5px] font-semibold tabular-nums text-espresso shrink-0">
                              {formatINR(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                style={{ backgroundColor: '#FCFAF6' }}
                className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-cream border-t border-taupe flex items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => setIsOrderTrackerOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-ivory hover:bg-taupe/30 border border-taupe text-[12.5px] font-semibold text-espresso transition-colors"
                >
                  Back to Menu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderTrackerOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 h-10 rounded-xl bg-olive hover:bg-olive-hover text-cream text-[12.5px] font-semibold flex items-center justify-center gap-1.5 shadow-subtle transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brass" />
                  <span>Settle / Split Bill</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
