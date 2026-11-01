import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { PaymentRecord, SplitMode, UpiProvider } from '../../types';
import {
  calculateEqualSplit,
  calculateItemsSplit,
  formatINR,
} from '../../lib/pricing';
import { RESTAURANT_CONFIG } from '../../data/menuData';

const UPI_APPS: {
  id: UpiProvider;
  name: string;
  tagline: string;
  badge: string;
}[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    tagline: 'Instant UPI • OKAxis / OKICICI',
    badge: 'GPay',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    tagline: 'Fast UPI • @ybl / @ibl',
    badge: 'PhonePe',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    tagline: 'Verified Merchant • @paytm',
    badge: 'Paytm',
  },
];

export const CheckoutDrawer: React.FC = () => {
  const {
    tableNumber,
    orderRounds,
    payments,
    billSummary,
    isCheckoutOpen,
    setIsCheckoutOpen,
    processPayment,
    setIsReviewOpen,
  } = useTableSession();

  const [splitMode, setSplitMode] = useState<SplitMode>('full');
  const [guestCount, setGuestCount] = useState<number>(3);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [upiProvider, setUpiProvider] = useState<UpiProvider>('gpay');
  const [paymentStage, setPaymentStage] = useState<
    'idle' | 'verifying' | 'success'
  >('idle');
  const [latestReceipt, setLatestReceipt] = useState<PaymentRecord | null>(
    null
  );

  // Reset transient states when opening drawer
  useEffect(() => {
    if (isCheckoutOpen) {
      setPaymentStage('idle');
      setLatestReceipt(null);
      const unpaidIds = billSummary.unpaidItems.map((i) => i.id);
      setSelectedItemIds(unpaidIds.slice(0, 1));
    }
  }, [isCheckoutOpen]);

  const equalSplit = useMemo(
    () => calculateEqualSplit(billSummary.remainingBalance, guestCount),
    [billSummary.remainingBalance, guestCount]
  );

  const itemsSplit = useMemo(
    () =>
      calculateItemsSplit(
        billSummary.unpaidItems,
        selectedItemIds,
        billSummary.remainingBalance
      ),
    [billSummary.unpaidItems, selectedItemIds, billSummary.remainingBalance]
  );

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compute active payable amount & breakdown based on current split mode
  const activePayable = useMemo(() => {
    if (billSummary.remainingBalance <= 0) {
      return {
        amount: 0,
        subtotal: 0,
        gst: 0,
        paidItemIds: [] as string[],
      };
    }

    if (splitMode === 'full') {
      return {
        amount: billSummary.remainingBalance,
        subtotal: billSummary.remainingSubtotal,
        gst: billSummary.remainingGst,
        paidItemIds: billSummary.unpaidItems.map((i) => i.id),
      };
    }

    if (splitMode === 'equal') {
      return {
        amount: equalSplit.perPersonShare,
        subtotal: equalSplit.perPersonSubtotal,
        gst: equalSplit.perPersonGst,
        paidItemIds: [] as string[],
      };
    }

    return {
      amount: itemsSplit.personalTotal,
      subtotal: itemsSplit.selectedSubtotal,
      gst: itemsSplit.proportionalGst,
      paidItemIds: itemsSplit.selectedItemIds,
    };
  }, [billSummary, splitMode, equalSplit, itemsSplit]);

  const handlePayNow = () => {
    if (
      paymentStage !== 'idle' ||
      activePayable.amount <= 0 ||
      billSummary.remainingBalance <= 0
    ) {
      return;
    }

    setPaymentStage('verifying');

    // Simulate 1.5-second UPI verification
    setTimeout(() => {
      const record = processPayment({
        mode: splitMode,
        provider: upiProvider,
        amount: activePayable.amount,
        subtotalPaid: activePayable.subtotal,
        gstPaid: activePayable.gst,
        guestCount: splitMode === 'equal' ? guestCount : undefined,
        paidItemIds: activePayable.paidItemIds,
      });

      setLatestReceipt(record);
      setPaymentStage('success');
      if (splitMode === 'items') {
        setSelectedItemIds([]);
      }
    }, 1500);
  };

  const handleContinueToReview = () => {
    setIsCheckoutOpen(false);
    setPaymentStage('idle');
    setTimeout(() => {
      setIsReviewOpen(true);
    }, 220);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Live Bill and Smart Split Payment"
          data-testid="checkout-drawer"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
        >
          {/* Dimmed Neutral Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (paymentStage !== 'verifying') setIsCheckoutOpen(false);
            }}
            className="fixed inset-0 bg-[#29251F]/60 backdrop-blur-sm"
          />

          {/* Dialog Container (100% Solid Opaque Pure Cream) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            style={{ backgroundColor: '#FCFAF6' }}
            className="relative z-10 w-full max-w-[480px] md:max-w-[620px] h-[94dvh] md:h-auto md:max-h-[88vh] flex flex-col rounded-t-[28px] md:rounded-2xl bg-cream border border-taupe shadow-2xl overflow-hidden"
          >
            {/* Top Drag Handle on Mobile */}
            <div className="w-10 h-1 rounded-full bg-taupe mx-auto mt-3 mb-1 shrink-0 md:hidden" />

            {/* Header: Financial Invoice Identity */}
            <div
              style={{ backgroundColor: '#FCFAF6' }}
              className="px-5 sm:px-6 py-3.5 border-b border-taupe flex items-center justify-between shrink-0 bg-cream"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-brass-dark">
                    {RESTAURANT_CONFIG.name} {RESTAURANT_CONFIG.subtitle}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-ivory border border-taupe text-espresso font-semibold">
                    Table #{tableNumber}
                  </span>
                </div>
                <h2 className="font-serif text-[21px] sm:text-[23px] font-medium text-espresso mt-0.5">
                  Dining Statement & Settlement
                </h2>
              </div>

              <button
                type="button"
                disabled={paymentStage === 'verifying'}
                aria-label="Close checkout drawer"
                data-testid="close-checkout-btn"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-ivory hover:bg-taupe/40 border border-taupe flex items-center justify-center text-warm-grey hover:text-espresso transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Verification & Success View */}
            {paymentStage !== 'idle' ? (
              <div
                data-testid="payment-verification-screen"
                style={{ backgroundColor: '#FCFAF6' }}
                className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center bg-cream"
              >
                {paymentStage === 'verifying' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-olive/10 border border-olive/20 flex items-center justify-center mx-auto text-olive">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <h3 className="font-serif text-[22px] font-medium text-espresso">
                      Verifying UPI Mandate...
                    </h3>
                    <p className="text-[13px] text-warm-grey max-w-[280px] mx-auto leading-relaxed">
                      Confirming{' '}
                      <span className="text-espresso font-bold tabular-nums">
                        {formatINR(activePayable.amount)}
                      </span>{' '}
                      with{' '}
                      {UPI_APPS.find((u) => u.id === upiProvider)?.name} for
                      Table #{tableNumber}
                    </p>
                    <p className="text-[10.5px] uppercase tracking-widest text-stone">
                      Encrypted Settlement Verification • 1.5s
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid="payment-success-view"
                    className="w-full max-w-md space-y-5"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/30 flex items-center justify-center mx-auto text-forest">
                      <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-forest">
                        Payment Successful
                      </span>
                      <h3 className="font-serif text-[28px] font-medium text-espresso mt-1 tabular-nums">
                        {formatINR(latestReceipt?.amount || 0)} Paid
                      </h3>
                      <p className="text-[12.5px] text-warm-grey mt-1">
                        Table #{tableNumber} dining balance has been updated in real time.
                      </p>
                    </div>

                    {/* Receipt Summary Card */}
                    <div className="bg-porcelain rounded-xl p-4 border border-taupe text-left space-y-2.5 text-[12.5px]">
                      <div className="flex justify-between">
                        <span className="text-warm-grey">Transaction Reference</span>
                        <span
                          data-testid="payment-tx-ref"
                          className="font-mono font-medium text-espresso"
                        >
                          {latestReceipt?.reference}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-grey">Payment Provider</span>
                        <span className="font-medium text-espresso">
                          {
                            UPI_APPS.find(
                              (u) => u.id === latestReceipt?.provider
                            )?.name
                          }{' '}
                          (Settled)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-grey">Settlement Mode</span>
                        <span className="font-medium capitalize text-espresso">
                          {latestReceipt?.mode === 'full'
                            ? 'Full Remaining Bill'
                            : latestReceipt?.mode === 'equal'
                            ? `Equal Split (1 of ${latestReceipt?.guestCount})`
                            : 'Personal Selected Items'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-taupe flex justify-between text-[13.5px]">
                        <span className="text-warm-grey">
                          Remaining Table Balance
                        </span>
                        <span
                          data-testid="post-payment-remaining-balance"
                          className="font-bold tabular-nums text-espresso"
                        >
                          {formatINR(billSummary.remainingBalance)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        data-testid="continue-to-review-btn"
                        onClick={handleContinueToReview}
                        className="w-full h-11 rounded-xl bg-olive hover:bg-olive-hover text-cream font-semibold text-[13.5px] shadow-subtle flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-brass" />
                        <span>Rate Experience & Unlock VIP Dessert</span>
                      </button>

                      {billSummary.remainingBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setPaymentStage('idle')}
                          className="w-full h-10 rounded-xl bg-ivory hover:bg-cream border border-taupe text-[12.5px] font-medium text-espresso transition-colors"
                        >
                          Pay Another Guest&apos;s Share (
                          {formatINR(billSummary.remainingBalance)} remaining)
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Main Financial Invoice Body */
              <>
                <div
                  style={{ backgroundColor: '#FCFAF6' }}
                  className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 pb-32 no-scrollbar bg-cream"
                >
                  {/* Financial Statement Card */}
                  <div className="bg-porcelain rounded-xl p-4 border border-taupe shadow-subtle space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-taupe">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                        Table #{tableNumber} Summary
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-forest font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        5% GST Itemized Breakdown
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[12.5px]">
                      <div className="flex justify-between text-warm-grey">
                        <span>Running Subtotal ({billSummary.allItems.reduce((s, i) => s + i.quantity, 0)} selections)</span>
                        <span
                          data-testid="bill-subtotal"
                          className="tabular-nums text-espresso font-medium"
                        >
                          {formatINR(billSummary.grossSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-warm-grey">
                        <span>CGST (2.5%) + SGST (2.5%) • 5% GST</span>
                        <span
                          data-testid="bill-gst"
                          className="tabular-nums text-espresso font-medium"
                        >
                          {formatINR(billSummary.grossGst)}
                        </span>
                      </div>
                      <div className="flex justify-between text-warm-grey pt-1 border-t border-taupe/60">
                        <span>Gross Bill Total</span>
                        <span
                          data-testid="bill-gross-total"
                          className="tabular-nums text-espresso font-semibold"
                        >
                          {formatINR(billSummary.grossTotal)}
                        </span>
                      </div>

                      {billSummary.paidTotal > 0 && (
                        <div className="flex justify-between text-forest font-medium">
                          <span>Previously Settled ({payments.length} transactions)</span>
                          <span
                            data-testid="bill-paid-total"
                            className="tabular-nums"
                          >
                            −{formatINR(billSummary.paidTotal)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline justify-between pt-2.5 border-t border-taupe">
                        <div>
                          <span className="text-[13.5px] font-bold text-espresso block">
                            Remaining Payable Balance
                          </span>
                          <span className="text-[10.5px] text-stone">
                            Due upon dining completion
                          </span>
                        </div>
                        <span
                          data-testid="bill-remaining-balance"
                          className="text-[22px] font-bold tabular-nums text-espresso"
                        >
                          {formatINR(billSummary.remainingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Split Mode Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                        Select Split Mode
                      </h3>
                      <span className="text-[11px] text-warm-grey">
                        Real-time GST allocation
                      </span>
                    </div>

                    <div
                      role="tablist"
                      aria-label="Bill Split Modes"
                      className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-ivory border border-taupe"
                    >
                      {(
                        [
                          { id: 'full', label: 'Pay Full Bill' },
                          { id: 'equal', label: 'Split Equally' },
                          { id: 'items', label: 'My Items' },
                        ] as { id: SplitMode; label: string }[]
                      ).map((tab) => {
                        const active = splitMode === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            data-testid={`split-mode-${tab.id}`}
                            onClick={() => setSplitMode(tab.id)}
                            className={`py-2 px-2 rounded-lg text-[12px] font-medium transition-all ${
                              active
                                ? 'bg-cream text-espresso font-bold shadow-subtle border border-taupe'
                                : 'text-warm-grey hover:text-espresso'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Mode 1: Full Bill */}
                    {splitMode === 'full' && (
                      <div
                        data-testid="panel-split-full"
                        className="mt-3 bg-porcelain rounded-xl p-3.5 border border-taupe flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-espresso">
                            Settle Entire Table Balance
                          </p>
                          <p className="text-[11px] text-warm-grey mt-0.5">
                            Covers all {orderRounds.length} rounds + 5% GST
                          </p>
                        </div>
                        <span className="text-[17px] font-bold tabular-nums text-espresso">
                          {formatINR(billSummary.remainingBalance)}
                        </span>
                      </div>
                    )}

                    {/* Mode 2: Split Equally */}
                    {splitMode === 'equal' && (
                      <div
                        data-testid="panel-split-equal"
                        className="mt-3 bg-porcelain rounded-xl p-4 border border-taupe space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-warm-grey" />
                            <div>
                              <p className="text-[13px] font-semibold text-espresso">
                                Guests Splitting
                              </p>
                              <p className="text-[11px] text-warm-grey">
                                Select between 2 and 8 people
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-cream border border-taupe rounded-lg p-1 shadow-subtle">
                            <button
                              type="button"
                              aria-label="Decrease guests"
                              data-testid="equal-guests-dec"
                              onClick={() =>
                                setGuestCount((c) => Math.max(2, c - 1))
                              }
                              className="w-7 h-7 rounded-md hover:bg-ivory flex items-center justify-center text-espresso"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                              data-testid="equal-guests-count"
                              className="w-6 text-center text-[13.5px] font-bold tabular-nums text-espresso"
                            >
                              {guestCount}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase guests"
                              data-testid="equal-guests-inc"
                              onClick={() =>
                                setGuestCount((c) => Math.min(8, c + 1))
                              }
                              className="w-7 h-7 rounded-md hover:bg-ivory flex items-center justify-center text-espresso"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Guest Count Slider */}
                        <input
                          type="range"
                          min={2}
                          max={8}
                          value={guestCount}
                          onChange={(e) =>
                            setGuestCount(Number(e.target.value))
                          }
                          aria-label="Guest count slider"
                          className="w-full accent-olive cursor-pointer"
                        />

                        <div className="pt-2 border-t border-taupe grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-cream border border-taupe/60">
                            <p className="text-[10px] uppercase text-stone">
                              Total Balance
                            </p>
                            <p className="text-[13px] font-bold tabular-nums text-espresso mt-0.5">
                              {formatINR(equalSplit.totalToSplit)}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-cream border border-taupe/60">
                            <p className="text-[10px] uppercase text-stone">
                              GST / Guest
                            </p>
                            <p
                              data-testid="equal-per-person-gst"
                              className="text-[13px] font-bold tabular-nums text-espresso mt-0.5"
                            >
                              {formatINR(equalSplit.perPersonGst)}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-olive/10 border border-olive/25">
                            <p className="text-[10px] uppercase text-olive font-bold">
                              Your Share
                            </p>
                            <p
                              data-testid="equal-per-person-share"
                              className="text-[14px] font-bold tabular-nums text-espresso mt-0.5"
                            >
                              {formatINR(equalSplit.perPersonShare)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Pay for My Items */}
                    {splitMode === 'items' && (
                      <div
                        data-testid="panel-split-items"
                        className="mt-3 bg-porcelain rounded-xl p-3.5 border border-taupe space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-espresso">
                            Select Your Dishes
                          </p>
                          <span className="text-[11px] text-warm-grey">
                            {selectedItemIds.length} selected
                          </span>
                        </div>

                        <div className="space-y-2">
                          {billSummary.allItems.map((item) => {
                            const isSelected = selectedItemIds.includes(
                              item.id
                            );
                            const itemTotal = item.unitPrice * item.quantity;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={item.paid}
                                data-testid={`split-item-checkbox-${item.id}`}
                                onClick={() => toggleItemSelection(item.id)}
                                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between gap-3 transition-all ${
                                  item.paid
                                    ? 'bg-ivory/50 border-taupe opacity-50 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-cream border-olive text-espresso shadow-subtle'
                                    : 'bg-cream/60 border-taupe text-warm-grey hover:bg-cream hover:text-espresso'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                                      item.paid
                                        ? 'border-forest bg-forest text-cream'
                                        : isSelected
                                        ? 'bg-olive border-olive text-cream'
                                        : 'border-taupe bg-cream'
                                    }`}
                                  >
                                    {(isSelected || item.paid) && (
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                    )}
                                  </span>

                                  <div className="min-w-0">
                                    <p className="text-[12.5px] font-semibold text-espresso truncate">
                                      {item.quantity}× {item.name}
                                    </p>
                                    <p className="text-[10.5px] text-warm-grey truncate">
                                      Round {item.roundNumber} •{' '}
                                      {item.customization.portion}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[12.5px] font-bold tabular-nums text-espresso">
                                    {formatINR(itemTotal)}
                                  </span>
                                  {item.paid && (
                                    <p className="text-[9.5px] text-forest font-semibold uppercase">
                                      Paid
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Personal Breakdown */}
                        <div className="pt-2.5 border-t border-taupe space-y-1 text-[11.5px]">
                          <div className="flex justify-between text-warm-grey">
                            <span>Selected Dishes Subtotal</span>
                            <span
                              data-testid="items-split-subtotal"
                              className="tabular-nums text-espresso"
                            >
                              {formatINR(itemsSplit.selectedSubtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-warm-grey">
                            <span>Proportional 5% GST</span>
                            <span
                              data-testid="items-split-gst"
                              className="tabular-nums text-espresso"
                            >
                              {formatINR(itemsSplit.proportionalGst)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[13.5px] font-bold text-espresso pt-1 border-t border-taupe/60">
                            <span>Your Personal Share</span>
                            <span
                              data-testid="items-split-total"
                              className="tabular-nums"
                            >
                              {formatINR(itemsSplit.personalTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Fired Order Rounds Breakdown */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone mb-2">
                      Itemized Order Rounds
                    </h3>

                    <div className="space-y-2.5">
                      {orderRounds.map((round) => (
                        <div
                          key={round.id}
                          className="bg-porcelain rounded-xl p-3 border border-taupe space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-taupe/60 pb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-espresso">
                              Round {round.roundNumber} • {round.firedAt}
                            </span>
                            <span className="text-[10.5px] text-warm-grey">
                              {round.status}
                            </span>
                          </div>

                          {round.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-2 text-[12px]"
                            >
                              <div>
                                <p className="font-medium text-espresso">
                                  {item.quantity}× {item.name}
                                  {item.paid && (
                                    <span className="ml-2 text-[9.5px] px-1.5 py-0.2 rounded bg-forest/10 text-forest font-semibold">
                                      PAID
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10.5px] text-warm-grey">
                                  {item.customization.portion} • {item.customization.spice}
                                  {item.customization.addOns.length > 0 &&
                                    ` • +${item.customization.addOns.map((a) => a.name).join(', ')}`}
                                </p>
                              </div>
                              <span className="font-semibold tabular-nums text-espresso">
                                {formatINR(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                        Express UPI Settlement
                      </h3>
                      <span className="text-[10.5px] text-stone">
                        NPCI UPI Sandbox
                      </span>
                    </div>

                    <div className="space-y-2">
                      {UPI_APPS.map((app) => {
                        const selected = upiProvider === app.id;
                        return (
                          <button
                            key={app.id}
                            type="button"
                            data-testid={`upi-option-${app.id}`}
                            onClick={() => setUpiProvider(app.id)}
                            className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                              selected
                                ? 'bg-cream border-olive shadow-subtle text-espresso'
                                : 'bg-porcelain border-taupe text-warm-grey hover:bg-cream hover:text-espresso'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-ivory border border-taupe flex items-center justify-center font-bold text-[11px] text-espresso">
                                {app.badge.slice(0, 3)}
                              </div>
                              <div className="text-left">
                                <p className="text-[13px] font-semibold text-espresso">
                                  {app.name}
                                </p>
                                <p className="text-[10.5px] text-warm-grey">
                                  {app.tagline}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                selected
                                  ? 'border-olive bg-olive text-cream'
                                  : 'border-taupe bg-transparent'
                              }`}
                            >
                              {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer (Solid 100% Opaque Pure Cream) */}
                <div
                  style={{ backgroundColor: '#FCFAF6' }}
                  className="absolute bottom-0 inset-x-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-cream border-t border-taupe"
                >
                  {billSummary.remainingBalance === 0 ? (
                    <button
                      type="button"
                      onClick={handleContinueToReview}
                      className="w-full h-12 rounded-xl bg-forest text-cream font-semibold text-[13.5px] flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Table Bill Settled • Leave a Review</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={activePayable.amount <= 0}
                      data-testid="pay-via-upi-btn"
                      onClick={handlePayNow}
                      className={`w-full h-12 rounded-xl font-semibold text-[13.5px] flex items-center justify-between px-5 transition-all shadow-subtle ${
                        activePayable.amount > 0
                          ? 'bg-olive hover:bg-olive-hover text-cream active:scale-[0.98]'
                          : 'bg-ivory border border-taupe text-stone cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>
                          Pay via{' '}
                          {UPI_APPS.find((u) => u.id === upiProvider)?.name}
                        </span>
                      </span>
                      <span
                        data-testid="active-payable-cta-amount"
                        className="text-[15px] font-bold tabular-nums"
                      >
                        {formatINR(activePayable.amount)}
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
