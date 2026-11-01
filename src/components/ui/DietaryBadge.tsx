import React from 'react';
import { Sparkles } from 'lucide-react';
import { DietaryType } from '../../types';

interface DietaryIndicatorProps {
  dietary: DietaryType;
  size?: 'sm' | 'md';
}

export const DietaryIndicator: React.FC<DietaryIndicatorProps> = ({
  dietary,
  size = 'md',
}) => {
  const isVeg = dietary === 'veg';
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      role="img"
      aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
      className={`inline-flex items-center justify-center ${boxSize} rounded-[4px] border ${
        isVeg
          ? 'border-forest bg-forest-subtle'
          : 'border-burgundy bg-burgundy-subtle'
      }`}
    >
      <span
        className={`${dotSize} rounded-full ${
          isVeg ? 'bg-forest' : 'bg-burgundy'
        }`}
      />
    </span>
  );
};

export const BestsellerBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-control bg-ivory border border-taupe text-[10px] font-semibold tracking-wider uppercase text-espresso">
    Bestseller
  </span>
);

export const ChefSpecialBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-control bg-brass/10 border border-brass/25 text-[10px] font-semibold tracking-wider uppercase text-brass-dark">
    <Sparkles className="w-2.5 h-2.5 text-brass" />
    Chef&apos;s Special
  </span>
);

