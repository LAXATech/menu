import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CartItem,
  Dish,
  OrderRound,
  OrderStatus,
  PaymentRecord,
  ReviewSubmission,
  SelectedCustomization,
  ServiceCooldownState,
  ServiceType,
  SplitMode,
  ToastMessage,
  UpiProvider,
} from '../types';
import { MENU_DISHES, RESTAURANT_CONFIG } from '../data/menuData';
import {
  BillSummary,
  calculateBillSummary,
  calculateUnitPrice,
} from '../lib/pricing';

const STORAGE_KEY = 'taptable_aura_session_v1';

const INITIAL_ROUND_1: OrderRound = {
  id: 'round-1',
  roundNumber: 1,
  firedAt: '7:42 PM',
  firedTimestamp: Date.now() - 1000 * 60 * 18,
  status: 'Served',
  items: [
    {
      id: 'r1-item-1',
      dishId: 'truffle-mushroom-croquettes',
      name: 'Truffle Mushroom Croquettes',
      category: 'Starters',
      dietary: 'veg',
      quantity: 1,
      basePrice: 380,
      unitPrice: 380,
      customization: {
        portion: 'Regular',
        spice: 'Mild',
        addOns: [],
        instructions: '',
      },
      roundNumber: 1,
      paid: false,
    },
    {
      id: 'r1-item-2',
      dishId: 'malabar-pepper-chicken',
      name: 'Malabar Pepper Chicken',
      category: 'Artisan Mains',
      dietary: 'non-veg',
      quantity: 1,
      basePrice: 620,
      unitPrice: 620,
      customization: {
        portion: 'Regular',
        spice: 'Fiery',
        addOns: [],
        instructions: 'Extra crispy parotta on the side',
      },
      roundNumber: 1,
      paid: false,
    },
  ],
};

const INITIAL_SERVICES: Record<ServiceType, ServiceCooldownState> = {
  water: {
    type: 'water',
    label: 'Bring Water',
    activeUntil: null,
    remainingSeconds: 0,
    requestCount: 0,
  },
  waiter: {
    type: 'waiter',
    label: 'Call Waiter',
    activeUntil: null,
    remainingSeconds: 0,
    requestCount: 0,
  },
  napkins: {
    type: 'napkins',
    label: 'Napkins / Clean',
    activeUntil: null,
    remainingSeconds: 0,
    requestCount: 0,
  },
};

interface TableSessionContextValue {
  restaurantSlug: string;
  tableNumber: string;
  tableWarning: string | null;
  activeGuests: number;
  nfcConnected: boolean;
  cart: CartItem[];
  orderRounds: OrderRound[];
  payments: PaymentRecord[];
  services: Record<ServiceType, ServiceCooldownState>;
  toasts: ToastMessage[];
  billSummary: BillSummary;
  review: ReviewSubmission | null;
  // Modal/Drawer controls
  customizingDish: Dish | null;
  setCustomizingDish: (dish: Dish | null) => void;
  isOrderTrackerOpen: boolean;
  setIsOrderTrackerOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  isFiringOrder: boolean;
  lastFiredRound: OrderRound | null;
  // Actions
  addToCart: (
    dish: Dish,
    quantity: number,
    customization: SelectedCustomization
  ) => void;
  quickAddDish: (dish: Dish) => void;
  decrementDishInCart: (dishId: string) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  getDishCartQuantity: (dishId: string) => number;
  triggerServiceRequest: (type: ServiceType) => void;
  fireOrderToKitchen: () => void;
  advanceRoundStatus: (roundId: string, status: OrderStatus) => void;
  processPayment: (params: {
    mode: SplitMode;
    provider: UpiProvider;
    amount: number;
    subtotalPaid: number;
    gstPaid: number;
    guestCount?: number;
    paidItemIds?: string[];
  }) => PaymentRecord;
  submitReview: (submission: ReviewSubmission) => void;
  dismissToast: (id: string) => void;
  pushToast: (title: string, subtitle?: string, type?: 'emerald' | 'amber' | 'info') => void;
  resetDemoSession: () => void;
}

const TableSessionContext = createContext<TableSessionContextValue | undefined>(
  undefined
);

function parseUrlTableInfo(): {
  slug: string;
  tableNumber: string;
  warning: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      slug: RESTAURANT_CONFIG.slug,
      tableNumber: RESTAURANT_CONFIG.defaultTable,
      warning: null,
    };
  }

  const url = new URL(window.location.href);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const rIndex = pathParts.indexOf('r');
  const slug =
    rIndex !== -1 && pathParts[rIndex + 1]
      ? pathParts[rIndex + 1]
      : RESTAURANT_CONFIG.slug;

  const rawTable = url.searchParams.get('table');

  if (!rawTable) {
    // Normalize URL quietly to /r/aura-kitchen?table=12 so deep links & refresh work seamlessly
    const normalizedPath = `/r/${RESTAURANT_CONFIG.slug}?table=${RESTAURANT_CONFIG.defaultTable}`;
    window.history.replaceState({}, '', normalizedPath);
    return {
      slug: RESTAURANT_CONFIG.slug,
      tableNumber: RESTAURANT_CONFIG.defaultTable,
      warning: null,
    };
  }

  const parsedNum = Number(rawTable);
  if (!Number.isInteger(parsedNum) || parsedNum < 1 || parsedNum > 50) {
    return {
      slug,
      tableNumber: RESTAURANT_CONFIG.defaultTable,
      warning: `Invalid table "${rawTable}" detected in URL — defaulted to Table #${RESTAURANT_CONFIG.defaultTable}.`,
    };
  }

  return {
    slug,
    tableNumber: String(parsedNum),
    warning: null,
  };
}

export const TableSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const urlInfo = useMemo(() => parseUrlTableInfo(), []);
  const [tableNumber, setTableNumber] = useState<string>(urlInfo.tableNumber);
  const [tableWarning, setTableWarning] = useState<string | null>(urlInfo.warning);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderRounds, setOrderRounds] = useState<OrderRound[]>([INITIAL_ROUND_1]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [services, setServices] =
    useState<Record<ServiceType, ServiceCooldownState>>(INITIAL_SERVICES);
  const [review, setReview] = useState<ReviewSubmission | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // UI Drawer states
  const [customizingDish, setCustomizingDish] = useState<Dish | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isFiringOrder, setIsFiringOrder] = useState(false);
  const [lastFiredRound, setLastFiredRound] = useState<OrderRound | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.cart)) setCart(parsed.cart);
        if (Array.isArray(parsed.orderRounds) && parsed.orderRounds.length > 0) {
          setOrderRounds(parsed.orderRounds);
        }
        if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
        if (parsed.review) setReview(parsed.review);
        if (parsed.services) {
          const now = Date.now();
          const hydratedServices: Record<ServiceType, ServiceCooldownState> = {
            ...INITIAL_SERVICES,
          };
          (['water', 'waiter', 'napkins'] as ServiceType[]).forEach((k) => {
            const s = parsed.services[k];
            if (s && s.activeUntil && s.activeUntil > now) {
              hydratedServices[k] = {
                ...INITIAL_SERVICES[k],
                activeUntil: s.activeUntil,
                remainingSeconds: Math.ceil((s.activeUntil - now) / 1000),
                requestCount: s.requestCount || 1,
              };
            }
          });
          setServices(hydratedServices);
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate TapTable session:', e);
    }
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tableNumber,
          cart,
          orderRounds,
          payments,
          services,
          review,
        })
      );
    } catch (e) {
      console.warn('Failed to persist TapTable session:', e);
    }
  }, [tableNumber, cart, orderRounds, payments, services, review]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (
      title: string,
      subtitle?: string,
      type: 'emerald' | 'amber' | 'info' = 'emerald'
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, subtitle, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  // Show warning toast if URL had an invalid table number
  useEffect(() => {
    if (tableWarning) {
      pushToast('Table Session Adjusted', tableWarning, 'amber');
    }
  }, [tableWarning, pushToast]);

  // 1-second tick for 60s service request cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setServices((prev) => {
        let mutated = false;
        const next: Record<ServiceType, ServiceCooldownState> = { ...prev };

        (['water', 'waiter', 'napkins'] as ServiceType[]).forEach((type) => {
          const item = prev[type];
          if (item.activeUntil) {
            const diff = Math.max(0, Math.ceil((item.activeUntil - now) / 1000));
            if (diff === 0) {
              mutated = true;
              next[type] = {
                ...item,
                activeUntil: null,
                remainingSeconds: 0,
              };
            } else if (diff !== item.remainingSeconds) {
              mutated = true;
              next[type] = {
                ...item,
                remainingSeconds: diff,
              };
            }
          }
        });

        return mutated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Controlled kitchen status simulation timers for newly fired rounds
  useEffect(() => {
    const activeRounds = orderRounds.filter((r) => r.status !== 'Served');
    if (activeRounds.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setOrderRounds((prev) =>
        prev.map((round) => {
          if (round.status === 'Served') return round;
          const elapsedSec = (now - round.firedTimestamp) / 1000;
          let nextStatus: OrderStatus = round.status;
          if (elapsedSec >= 36) {
            nextStatus = 'Served';
          } else if (elapsedSec >= 22) {
            nextStatus = 'Ready to Serve';
          } else if (elapsedSec >= 8) {
            nextStatus = 'Chef Preparing';
          }
          if (nextStatus !== round.status) {
            return { ...round, status: nextStatus };
          }
          return round;
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [orderRounds]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore on unsupported browsers
      }
    }
  };

  const triggerServiceRequest = useCallback(
    (type: ServiceType) => {
      const current = services[type];
      if (current.activeUntil && current.remainingSeconds > 0) return;

      triggerHaptic();
      const cooldownSeconds = 60;
      const activeUntil = Date.now() + cooldownSeconds * 1000;

      setServices((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          activeUntil,
          remainingSeconds: cooldownSeconds,
          requestCount: prev[type].requestCount + 1,
        },
      }));

      const messages: Record<
        ServiceType,
        { title: string; subtitle: string }
      > = {
        water: {
          title: 'Chilled Still & Sparkling Water Requested',
          subtitle: `Steward notified for Table #${tableNumber} • Arriving shortly`,
        },
        waiter: {
          title: 'Table Butler Summoned',
          subtitle: `Assigned captain alerted for Table #${tableNumber}`,
        },
        napkins: {
          title: 'Fresh Linen & Table Refresh Requested',
          subtitle: `Dispatched to Table #${tableNumber}`,
        },
      };

      pushToast(messages[type].title, messages[type].subtitle, 'emerald');
    },
    [services, tableNumber, pushToast]
  );

  const addToCart = useCallback(
    (
      dish: Dish,
      quantity: number,
      customization: SelectedCustomization
    ) => {
      triggerHaptic();
      const unitPrice = calculateUnitPrice(dish, customization);
      const signature = JSON.stringify({
        dishId: dish.id,
        portion: customization.portion,
        spice: customization.spice,
        addOns: customization.addOns.map((a) => a.id).sort(),
        instructions: customization.instructions.trim().toLowerCase(),
      });

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => {
          const itemSig = JSON.stringify({
            dishId: item.dish.id,
            portion: item.customization.portion,
            spice: item.customization.spice,
            addOns: item.customization.addOns.map((a) => a.id).sort(),
            instructions: item.customization.instructions.trim().toLowerCase(),
          });
          return itemSig === signature;
        });

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [
          ...prev,
          {
            cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            dish,
            quantity,
            customization,
            unitPrice,
          },
        ];
      });

      pushToast(
        `Added ${quantity}× ${dish.name}`,
        `${customization.portion} • ${customization.spice} Spice`,
        'amber'
      );
    },
    [pushToast]
  );

  const quickAddDish = useCallback(
    (dish: Dish) => {
      addToCart(dish, 1, {
        portion: 'Regular',
        spice: dish.defaultSpice,
        addOns: [],
        instructions: '',
      });
    },
    [addToCart]
  );

  const decrementDishInCart = useCallback((dishId: string) => {
    triggerHaptic();
    setCart((prev) => {
      // Find the most recently added cart line for this dish
      const reverseIdx = [...prev].reverse().findIndex((i) => i.dish.id === dishId);
      if (reverseIdx === -1) return prev;
      const targetIdx = prev.length - 1 - reverseIdx;
      const target = prev[targetIdx];

      if (target.quantity <= 1) {
        return prev.filter((_, idx) => idx !== targetIdx);
      }

      const next = [...prev];
      next[targetIdx] = {
        ...target,
        quantity: target.quantity - 1,
      };
      return next;
    });
  }, []);

  const updateCartItemQuantity = useCallback((cartItemId: string, delta: number) => {
    triggerHaptic();
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const getDishCartQuantity = useCallback(
    (dishId: string) =>
      cart
        .filter((item) => item.dish.id === dishId)
        .reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const fireOrderToKitchen = useCallback(() => {
    if (cart.length === 0 || isFiringOrder) return;
    triggerHaptic();
    setIsFiringOrder(true);

    const nextRoundNumber = orderRounds.length + 1;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newRound: OrderRound = {
      id: `round-${nextRoundNumber}-${Date.now()}`,
      roundNumber: nextRoundNumber,
      firedAt: formattedTime,
      firedTimestamp: Date.now(),
      status: 'Queued',
      items: cart.map((cartItem, index) => ({
        id: `r${nextRoundNumber}-item-${index + 1}-${Date.now()}`,
        dishId: cartItem.dish.id,
        name: cartItem.dish.name,
        category: cartItem.dish.category,
        dietary: cartItem.dish.dietary,
        quantity: cartItem.quantity,
        basePrice: cartItem.dish.price,
        unitPrice: cartItem.unitPrice,
        customization: cartItem.customization,
        roundNumber: nextRoundNumber,
        paid: false,
      })),
    };

    setLastFiredRound(newRound);
    setOrderRounds((prev) => [...prev, newRound]);
    setCart([]);

    setTimeout(() => {
      setIsFiringOrder(false);
      setIsOrderTrackerOpen(true);
    }, 1550);
  }, [cart, isFiringOrder, orderRounds.length]);

  const advanceRoundStatus = useCallback(
    (roundId: string, status: OrderStatus) => {
      setOrderRounds((prev) =>
        prev.map((r) => (r.id === roundId ? { ...r, status } : r))
      );
    },
    []
  );

  const billSummary = useMemo(
    () => calculateBillSummary(orderRounds, payments),
    [orderRounds, payments]
  );

  const processPayment = useCallback(
    (params: {
      mode: SplitMode;
      provider: UpiProvider;
      amount: number;
      subtotalPaid: number;
      gstPaid: number;
      guestCount?: number;
      paidItemIds?: string[];
    }): PaymentRecord => {
      triggerHaptic();
      const refSuffix = Math.floor(100000 + Math.random() * 900000);
      const record: PaymentRecord = {
        id: `pay-${Date.now()}`,
        reference: `UPI-AURA-${refSuffix}`,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        mode: params.mode,
        provider: params.provider,
        amount: params.amount,
        subtotalPaid: params.subtotalPaid,
        gstPaid: params.gstPaid,
        guestCount: params.guestCount,
        paidItemIds: params.paidItemIds || [],
      };

      setPayments((prev) => [...prev, record]);

      // Mark items as paid when paying full bill or specific items
      if (params.mode === 'full') {
        setOrderRounds((prev) =>
          prev.map((round) => ({
            ...round,
            items: round.items.map((item) => ({
              ...item,
              paid: true,
              paidBy: 'Full Table Settlement',
            })),
          }))
        );
      } else if (params.mode === 'items' && params.paidItemIds?.length) {
        const idSet = new Set(params.paidItemIds);
        setOrderRounds((prev) =>
          prev.map((round) => ({
            ...round,
            items: round.items.map((item) =>
              idSet.has(item.id)
                ? { ...item, paid: true, paidBy: 'Personal Split' }
                : item
            ),
          }))
        );
      } else if (
        params.mode === 'equal' &&
        params.amount >= billSummary.remainingBalance
      ) {
        // Final equal share settles all remaining items
        setOrderRounds((prev) =>
          prev.map((round) => ({
            ...round,
            items: round.items.map((item) => ({
              ...item,
              paid: true,
            })),
          }))
        );
      }

      return record;
    },
    [billSummary.remainingBalance]
  );

  const submitReview = useCallback(
    (submission: ReviewSubmission) => {
      setReview(submission);
      pushToast(
        submission.rating >= 4
          ? 'VIP Privilege Unlocked'
          : 'Private Note Delivered to General Manager',
        submission.rating >= 4
          ? 'Complimentary dessert voucher saved to your session'
          : 'Our floor manager will visit Table #12 momentarily',
        'emerald'
      );
    },
    [pushToast]
  );

  const resetDemoSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCart([]);
    setOrderRounds([INITIAL_ROUND_1]);
    setPayments([]);
    setServices(INITIAL_SERVICES);
    setReview(null);
    setTableNumber(RESTAURANT_CONFIG.defaultTable);
    setTableWarning(null);
    pushToast(
      'Demo Session Reset',
      'Restored Table #12 initial Round 1 state',
      'info'
    );
  }, [pushToast]);

  return (
    <TableSessionContext.Provider
      value={{
        restaurantSlug: urlInfo.slug,
        tableNumber,
        tableWarning,
        activeGuests: RESTAURANT_CONFIG.activeGuests,
        nfcConnected: true,
        cart,
        orderRounds,
        payments,
        services,
        toasts,
        billSummary,
        review,
        customizingDish,
        setCustomizingDish,
        isOrderTrackerOpen,
        setIsOrderTrackerOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isReviewOpen,
        setIsReviewOpen,
        isFiringOrder,
        lastFiredRound,
        addToCart,
        quickAddDish,
        decrementDishInCart,
        updateCartItemQuantity,
        getDishCartQuantity,
        triggerServiceRequest,
        fireOrderToKitchen,
        advanceRoundStatus,
        processPayment,
        submitReview,
        dismissToast,
        pushToast,
        resetDemoSession,
      }}
    >
      {children}
    </TableSessionContext.Provider>
  );
};

export function useTableSession(): TableSessionContextValue {
  const ctx = useContext(TableSessionContext);
  if (!ctx) {
    throw new Error('useTableSession must be used inside TableSessionProvider');
  }
  return ctx;
}
