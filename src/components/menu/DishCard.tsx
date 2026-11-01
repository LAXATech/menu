import React, { useState } from 'react';
import { Clock, Flame, Minus, Plus } from 'lucide-react';
import { Dish } from '../../types';
import { formatINR } from '../../lib/pricing';
import { useTableSession } from '../../context/TableSessionContext';
import {
  BestsellerBadge,
  ChefSpecialBadge,
  DietaryIndicator,
} from '../ui/DietaryBadge';

interface DishCardProps {
  dish: Dish;
  index: number;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const {
    getDishCartQuantity,
    setCustomizingDish,
    decrementDishInCart,
  } = useTableSession();

  const quantityInCart = getDishCartQuantity(dish.id);
  const [imgSrc, setImgSrc] = useState<string>(dish.image);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const spiceDots =
    dish.defaultSpice === 'Fiery'
      ? 3
      : dish.defaultSpice === 'Medium'
      ? 2
      : 1;

  return (
    <article
      data-testid={`dish-card-${dish.id}`}
      onClick={() => setCustomizingDish(dish)}
      className="group relative py-4 md:p-4 first:pt-2 md:first:pt-4 last:border-b-0 md:rounded-2xl md:bg-cream md:border md:border-taupe md:shadow-subtle hover:border-olive/30 flex items-start justify-between gap-3.5 sm:gap-4 cursor-pointer transition-all duration-200"
    >
      {/* Left Column: Editorial Typography & Information */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <DietaryIndicator dietary={dish.dietary} size="md" />

          {dish.isBestseller && <BestsellerBadge />}
          {dish.isChefSpecial && <ChefSpecialBadge />}
        </div>

        {/* Dish Title */}
        <h3 className="text-[15.5px] sm:text-[16.5px] font-semibold text-espresso group-hover:text-olive transition-colors leading-snug">
          {dish.name}
        </h3>

        {/* Price & Calories */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-bold tabular-nums text-espresso">
            {formatINR(dish.price)}
          </span>
          <span className="text-[11px] text-stone tabular-nums">
            • {dish.calories} kcal
          </span>
        </div>

        {/* Editorial Culinary Description */}
        <p className="mt-1.5 text-[12px] sm:text-[12.5px] leading-relaxed text-warm-grey line-clamp-2">
          {dish.description}
        </p>

        {/* Pairing Note (if present) */}
        {dish.pairingNote && (
          <p className="mt-1 text-[11px] italic text-brass-dark truncate">
            {dish.pairingNote}
          </p>
        )}

        {/* Bottom Metadata: Preparation Time, Spice & Customisable status */}
        <div className="mt-2.5 flex items-center gap-2.5 text-[11px] text-stone">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone" />
            {dish.prepTime}
          </span>

          <span className="w-1 h-1 rounded-full bg-taupe" />

          <span
            className="inline-flex items-center gap-1"
            title={`Spice level: ${dish.defaultSpice}`}
          >
            <Flame className="w-3 h-3 text-stone" />
            <span className="text-warm-grey">{dish.defaultSpice}</span>
            <span className="inline-flex gap-0.5 ml-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < spiceDots ? 'bg-olive' : 'bg-taupe'
                  }`}
                />
              ))}
            </span>
          </span>

          <span className="w-1 h-1 rounded-full bg-taupe" />

          <span className="text-stone text-[10.5px]">
            Customisable
          </span>
        </div>
      </div>

      {/* Right Column: Food Photography & Floating ADD Action */}
      <div className="relative shrink-0 w-[116px] sm:w-[126px] pb-4 self-center">
        <div className="relative w-[116px] sm:w-[126px] h-[110px] sm:h-[118px] rounded-2xl overflow-hidden bg-ivory border border-taupe shadow-subtle">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-ivory" />
          )}
          <img
            src={imgSrc}
            alt={dish.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (imgSrc !== dish.fallbackImage) {
                setImgSrc(dish.fallbackImage);
              }
            }}
            className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Floating Action Control (Centered on bottom edge with zero text collisions) */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {quantityInCart === 0 ? (
            <button
              type="button"
              data-testid={`add-dish-${dish.id}`}
              onClick={() => setCustomizingDish(dish)}
              className="min-w-[84px] sm:min-w-[90px] h-[32px] px-3 rounded-lg bg-[#FCFAF6] hover:bg-olive hover:text-cream border border-[#DED8CE] hover:border-olive text-espresso shadow-[0_2px_8px_rgba(41,37,31,0.08)] flex items-center justify-center gap-1 text-[11px] font-bold tracking-wider uppercase active:scale-95 transition-all"
            >
              <span>ADD</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="min-w-[92px] h-[32px] px-1 rounded-lg bg-olive text-cream shadow-[0_2px_8px_rgba(41,37,31,0.12)] flex items-center justify-between font-bold">
              <button
                type="button"
                aria-label={`Decrease quantity of ${dish.name}`}
                data-testid={`dec-dish-${dish.id}`}
                onClick={() => decrementDishInCart(dish.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-black/15 active:scale-90 transition-transform"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span
                data-testid={`qty-dish-${dish.id}`}
                className="text-[12px] tabular-nums px-1 font-bold"
              >
                {quantityInCart}
              </span>
              <button
                type="button"
                aria-label={`Customize or add another ${dish.name}`}
                data-testid={`inc-dish-${dish.id}`}
                onClick={() => setCustomizingDish(dish)}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-black/15 active:scale-90 transition-transform"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
