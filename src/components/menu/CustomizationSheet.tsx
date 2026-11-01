import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flame, Minus, Plus, X } from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { STANDARD_ADD_ONS } from '../../data/menuData';
import { AddOnOption, PortionSize, SpiceLevel } from '../../types';
import { calculateUnitPrice, formatINR } from '../../lib/pricing';
import { DietaryIndicator } from '../ui/DietaryBadge';

const PORTIONS: PortionSize[] = ['Regular', 'Large'];
const SPICE_LEVELS: SpiceLevel[] = ['Mild', 'Medium', 'Fiery'];

export const CustomizationSheet: React.FC = () => {
  const { customizingDish, setCustomizingDish, addToCart } = useTableSession();

  const [portion, setPortion] = useState<PortionSize>('Regular');
  const [spice, setSpice] = useState<SpiceLevel>('Medium');
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (customizingDish) {
      setPortion('Regular');
      setSpice(customizingDish.defaultSpice);
      setSelectedAddOns([]);
      setInstructions('');
      setQuantity(1);
      setImgSrc(customizingDish.image);
    }
  }, [customizingDish]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customizingDish) {
        setCustomizingDish(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [customizingDish, setCustomizingDish]);

  if (!customizingDish) return null;

  const toggleAddOn = (addon: AddOnOption) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const unitPrice = calculateUnitPrice(customizingDish, {
    portion,
    spice,
    addOns: selectedAddOns,
    instructions,
  });
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    addToCart(customizingDish, quantity, {
      portion,
      spice,
      addOns: selectedAddOns,
      instructions: instructions.trim(),
    });
    setCustomizingDish(null);
  };

  return (
    <AnimatePresence>
      {customizingDish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-dish-title"
          data-testid="customization-sheet"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
        >
          {/* Dimmed Neutral Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCustomizingDish(null)}
            className="fixed inset-0 bg-[#29251F]/60 backdrop-blur-sm"
          />

          {/* Modal Container: Solid Opaque Pure Cream */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            style={{ backgroundColor: '#FCFAF6' }}
            className="relative z-10 w-full max-w-[480px] md:max-w-[560px] max-h-[92dvh] md:max-h-[85vh] flex flex-col rounded-t-[28px] md:rounded-2xl bg-cream border border-taupe shadow-2xl overflow-hidden"
          >
            {/* Drag Handle on Mobile */}
            <div className="w-10 h-1 rounded-full bg-taupe mx-auto mt-3 mb-1 shrink-0 md:hidden" />

            {/* Scrollable Body */}
            <div
              style={{ backgroundColor: '#FCFAF6' }}
              className="overflow-y-auto flex-1 pb-28 no-scrollbar bg-cream"
            >
              {/* Dish Hero Photography */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-ivory">
                <img
                  src={imgSrc || customizingDish.image}
                  alt={customizingDish.name}
                  onError={() => {
                    if (imgSrc !== customizingDish.fallbackImage) {
                      setImgSrc(customizingDish.fallbackImage);
                    }
                  }}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FCFAF6] via-transparent to-transparent" />

                <button
                  type="button"
                  aria-label="Close customization sheet"
                  data-testid="close-customization-btn"
                  onClick={() => setCustomizingDish(null)}
                  className="absolute top-3 right-4 w-8 h-8 rounded-full bg-[#FCFAF6]/90 border border-taupe flex items-center justify-center text-espresso hover:bg-cream active:scale-95 transition-all shadow-subtle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 sm:px-6 -mt-8 relative z-10 space-y-5">
                {/* Dish Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <DietaryIndicator dietary={customizingDish.dietary} size="sm" />
                    <span className="text-[11px] uppercase tracking-wider text-warm-grey font-semibold">
                      {customizingDish.category}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <h2
                      id="customize-dish-title"
                      className="font-serif text-[24px] sm:text-[27px] font-medium text-espresso leading-snug"
                    >
                      {customizingDish.name}
                    </h2>
                    <span className="text-[18px] font-bold tabular-nums text-espresso shrink-0 mt-1">
                      {formatINR(customizingDish.price)}
                    </span>
                  </div>

                  <p className="text-[12.5px] text-warm-grey mt-1.5 leading-relaxed">
                    {customizingDish.description}
                  </p>
                </div>

                {/* Portion Selector */}
                <div className="bg-porcelain rounded-xl p-4 border border-taupe">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-espresso">
                        Portion Size
                      </h3>
                      <p className="text-[11px] text-warm-grey">
                        Select your preferred serving
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-ivory border border-taupe text-warm-grey">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {PORTIONS.map((p) => {
                      const isSelected = portion === p;
                      const priceLabel =
                        p === 'Regular'
                          ? formatINR(customizingDish.price)
                          : `${formatINR(
                              customizingDish.price +
                                customizingDish.largePriceDelta
                            )} (+${formatINR(customizingDish.largePriceDelta)})`;

                      return (
                        <button
                          key={p}
                          type="button"
                          data-testid={`portion-${p}`}
                          onClick={() => setPortion(p)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-cream border-olive text-espresso shadow-subtle'
                              : 'bg-ivory/50 border-taupe text-warm-grey hover:bg-cream hover:text-espresso'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold">
                              {p}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-olive bg-olive text-cream'
                                  : 'border-taupe bg-transparent'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cream" />}
                            </span>
                          </div>
                          <p className="text-[11.5px] tabular-nums text-warm-grey mt-1">
                            {priceLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spice Preference */}
                <div className="bg-porcelain rounded-xl p-4 border border-taupe">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-espresso">
                        Spice Preference
                      </h3>
                      <p className="text-[11px] text-warm-grey">
                        Tailored to your palate
                      </p>
                    </div>
                    <span className="text-[11px] text-stone">
                      Default: {customizingDish.defaultSpice}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SPICE_LEVELS.map((level) => {
                      const active = spice === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          data-testid={`spice-${level}`}
                          onClick={() => setSpice(level)}
                          className={`py-2 px-3 rounded-lg border text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            active
                              ? 'bg-cream border-olive text-espresso shadow-subtle'
                              : 'bg-ivory/50 border-taupe text-warm-grey hover:bg-cream'
                          }`}
                        >
                          <Flame
                            className={`w-3.5 h-3.5 ${
                              active ? 'text-olive' : 'text-stone'
                            }`}
                          />
                          <span>{level}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curated Add-ons */}
                <div className="bg-porcelain rounded-xl p-4 border border-taupe">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-espresso">
                        Artisan Add-ons
                      </h3>
                      <p className="text-[11px] text-warm-grey">
                        Optional enhancements
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-stone">
                      Optional
                    </span>
                  </div>

                  <div className="space-y-2">
                    {STANDARD_ADD_ONS.map((addon) => {
                      const checked = selectedAddOns.some(
                        (a) => a.id === addon.id
                      );
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          data-testid={`Opacity-${addon.id}`}
                          onClick={() => toggleAddOn(addon)}
                          className={`w-full px-3.5 py-2.5 rounded-lg border flex items-center justify-between transition-all ${
                            checked
                              ? 'bg-cream border-olive text-espresso shadow-subtle'
                              : 'bg-ivory/50 border-taupe text-warm-grey hover:bg-cream'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                checked
                                  ? 'bg-olive border-olive text-cream'
                                  : 'border-taupe bg-cream'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </span>
                            <span className="text-[13px] font-medium text-espresso">
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-[12.5px] font-semibold tabular-nums text-espresso">
                            +{formatINR(addon.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-porcelain rounded-xl p-4 border border-taupe">
                  <label
                    htmlFor="kitchen-notes"
                    className="block text-[11.5px] font-semibold uppercase tracking-wider text-espresso mb-1.5"
                  >
                    Kitchen Instructions
                  </label>
                  <textarea
                    id="kitchen-notes"
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Less oil, extra crispy, no onions..."
                    className="w-full rounded-lg bg-cream border border-taupe focus:border-olive focus:outline-none p-2.5 text-[13px] text-espresso placeholder:text-warm-grey resize-none shadow-subtle"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action Footer (Solid Opaque Cream) */}
            <div
              style={{ backgroundColor: '#FCFAF6' }}
              className="absolute bottom-0 inset-x-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-cream border-t border-taupe flex items-center gap-3"
            >
              {/* Quantity Stepper */}
              <div className="h-11 px-1.5 rounded-xl bg-porcelain border border-taupe flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  data-testid="sheet-qty-dec"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-grey hover:text-espresso hover:bg-cream active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  data-testid="sheet-qty-val"
                  className="w-6 text-center text-[14px] font-semibold tabular-nums text-espresso"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  data-testid="sheet-qty-inc"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-espresso hover:bg-cream active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Primary Add to Order CTA */}
              <button
                type="button"
                data-testid="confirm-add-to-order"
                onClick={handleConfirm}
                className="flex-1 h-11 rounded-xl bg-olive hover:bg-olive-hover text-cream font-semibold text-[13.5px] tracking-wide shadow-subtle flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span>Add to Order</span>
                <span>•</span>
                <span className="tabular-nums font-bold">
                  {formatINR(totalPrice)}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
