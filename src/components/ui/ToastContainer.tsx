import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, Info, X } from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTableSession();

  return (
    <div
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[380px] pointer-events-none flex flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto bg-[#FCFAF6] border border-[#DED8CE] rounded-xl px-4 py-3 shadow-[0_12px_36px_-6px_rgba(41,37,31,0.18)] flex items-center gap-3"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                toast.type === 'forest' || toast.type === 'emerald'
                  ? 'bg-forest/10 text-forest'
                  : toast.type === 'brass' || toast.type === 'amber'
                  ? 'bg-brass/15 text-brass-dark'
                  : 'bg-taupe/40 text-espresso'
              }`}
            >
              {toast.type === 'forest' || toast.type === 'emerald' ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : toast.type === 'brass' || toast.type === 'amber' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <Info className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-espresso leading-snug truncate">
                {toast.title}
              </p>
              {toast.subtitle && (
                <p className="text-[11px] text-warm-grey leading-tight mt-0.5 truncate">
                  {toast.subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md text-stone hover:text-espresso hover:bg-taupe/20 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
