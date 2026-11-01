import {
  Dish,
  FiredOrderItem,
  OrderRound,
  PaymentRecord,
  SelectedCustomization,
} from '../types';
import { RESTAURANT_CONFIG } from '../data/menuData';

export const GST_RATE = RESTAURANT_CONFIG.gstRate; // 5%

export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export function calculateUnitPrice(
  dish: Dish,
  customization: SelectedCustomization
): number {
  const portionDelta = customization.portion === 'Large' ? dish.largePriceDelta : 0;
  const addOnsTotal = customization.addOns.reduce((sum, addon) => sum + addon.price, 0);
  return dish.price + portionDelta + addOnsTotal;
}

export interface BillSummary {
  allItems: FiredOrderItem[];
  unpaidItems: FiredOrderItem[];
  grossSubtotal: number;
  grossGst: number;
  grossTotal: number;
  paidTotal: number;
  remainingSubtotal: number;
  remainingGst: number;
  remainingBalance: number;
}

export function calculateBillSummary(
  rounds: OrderRound[],
  payments: PaymentRecord[]
): BillSummary {
  const allItems = rounds.flatMap((round) => round.items);
  const unpaidItems = allItems.filter((item) => !item.paid);

  const grossSubtotal = allItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const grossGst = Math.round(grossSubtotal * GST_RATE);
  const grossTotal = grossSubtotal + grossGst;

  const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Remaining balance accounts for both item-level payments and equal/full payments
  const rawRemaining = Math.max(0, grossTotal - paidTotal);
  const remainingSubtotal = Math.round(rawRemaining / (1 + GST_RATE));
  const remainingGst = rawRemaining - remainingSubtotal;

  return {
    allItems,
    unpaidItems,
    grossSubtotal,
    grossGst,
    grossTotal,
    paidTotal,
    remainingSubtotal,
    remainingGst,
    remainingBalance: rawRemaining,
  };
}

export interface EqualSplitBreakdown {
  guestCount: number;
  totalToSplit: number;
  perPersonShare: number;
  lastPersonShare: number;
  perPersonGst: number;
  perPersonSubtotal: number;
  shares: number[];
}

/**
 * Splits `remainingBalance` across `guestCount` guests (2-8) so that all shares sum
 * to the exact rupee with zero rounding discrepancy.
 */
export function calculateEqualSplit(
  remainingBalance: number,
  guestCount: number
): EqualSplitBreakdown {
  const safeCount = Math.min(8, Math.max(2, guestCount));
  if (remainingBalance <= 0) {
    return {
      guestCount: safeCount,
      totalToSplit: 0,
      perPersonShare: 0,
      lastPersonShare: 0,
      perPersonGst: 0,
      perPersonSubtotal: 0,
      shares: Array(safeCount).fill(0),
    };
  }

  const baseShare = Math.floor(remainingBalance / safeCount);
  const remainder = remainingBalance - baseShare * safeCount;

  // Distribute ₹1 to the first `remainder` guests or put the remainder on the final share
  const shares = Array.from({ length: safeCount }, (_, index) =>
    index === safeCount - 1 ? baseShare + remainder : baseShare
  );

  const primaryShare = shares[0];
  const perPersonSubtotal = Math.round(primaryShare / (1 + GST_RATE));
  const perPersonGst = primaryShare - perPersonSubtotal;

  return {
    guestCount: safeCount,
    totalToSplit: remainingBalance,
    perPersonShare: primaryShare,
    lastPersonShare: shares[safeCount - 1],
    perPersonGst,
    perPersonSubtotal,
    shares,
  };
}

export interface ItemSplitBreakdown {
  selectedItemIds: string[];
  selectedSubtotal: number;
  selectedAddOnsTotal: number;
  proportionalGst: number;
  personalTotal: number;
}

export function calculateItemsSplit(
  unpaidItems: FiredOrderItem[],
  selectedIds: string[],
  maxRemainingBalance: number
): ItemSplitBreakdown {
  const selected = unpaidItems.filter((item) => selectedIds.includes(item.id));
  const selectedSubtotal = selected.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const selectedAddOnsTotal = selected.reduce((sum, item) => {
    const addOnUnit = item.customization.addOns.reduce((a, b) => a + b.price, 0);
    return sum + addOnUnit * item.quantity;
  }, 0);

  const proportionalGst = Math.round(selectedSubtotal * GST_RATE);
  const rawTotal = selectedSubtotal + proportionalGst;
  const personalTotal = Math.min(maxRemainingBalance, rawTotal);

  return {
    selectedItemIds: selected.map((i) => i.id),
    selectedSubtotal,
    selectedAddOnsTotal,
    proportionalGst: Math.max(0, personalTotal - selectedSubtotal),
    personalTotal,
  };
}
