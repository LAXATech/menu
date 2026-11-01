import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  testIdPrefix?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
  ariaLabel = 'Quantity',
  testIdPrefix = 'stepper',
}) => {
  const containerSizes = {
    sm: 'h-8 px-1 rounded-control gap-1',
    md: 'h-9 px-1.5 rounded-button gap-1.5',
    lg: 'h-11 px-2 rounded-xl gap-2',
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-xs min-w-[1.25rem]',
    md: 'text-xs min-w-[1.5rem]',
    lg: 'text-sm min-w-[1.75rem]',
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-between bg-olive text-cream shadow-subtle ${containerSizes[size]}`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        data-testid={`${testIdPrefix}-dec`}
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        className={`${buttonSizes[size]} rounded-control flex items-center justify-center hover:bg-black/15 active:scale-90 transition-transform`}
      >
        <Minus className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      <span
        data-testid={`${testIdPrefix}-val`}
        className={`font-semibold tabular-nums text-center select-none ${textSizes[size]}`}
      >
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        data-testid={`${testIdPrefix}-inc`}
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        className={`${buttonSizes[size]} rounded-control flex items-center justify-center hover:bg-black/15 active:scale-90 transition-transform`}
      >
        <Plus className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
};

