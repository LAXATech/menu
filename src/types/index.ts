export type MenuCategory =
  | 'Starters'
  | 'Woodfire Pizzas'
  | 'Artisan Mains'
  | 'Craft Mocktails'
  | 'Desserts';

export type DietaryType = 'veg' | 'non-veg';

export type SpiceLevel = 'Mild' | 'Medium' | 'Fiery';

export type PortionSize = 'Regular' | 'Large';

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  largePriceDelta: number;
  description: string;
  ingredients: string[];
  prepTime: string;
  calories: number;
  dietary: DietaryType;
  defaultSpice: SpiceLevel;
  isBestseller?: boolean;
  isChefSpecial?: boolean;
  image: string;
  fallbackImage: string;
  pairingNote?: string;
}

export interface SelectedCustomization {
  portion: PortionSize;
  spice: SpiceLevel;
  addOns: AddOnOption[];
  instructions: string;
}

export interface CartItem {
  cartItemId: string;
  dish: Dish;
  quantity: number;
  customization: SelectedCustomization;
  unitPrice: number;
}

export type OrderStatus = 'Queued' | 'Chef Preparing' | 'Ready to Serve' | 'Served';

export interface FiredOrderItem {
  id: string;
  dishId: string;
  name: string;
  category: MenuCategory;
  dietary: DietaryType;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  customization: SelectedCustomization;
  roundNumber: number;
  paid: boolean;
  paidBy?: string;
}

export interface OrderRound {
  id: string;
  roundNumber: number;
  firedAt: string;
  firedTimestamp: number;
  status: OrderStatus;
  items: FiredOrderItem[];
}

export type ServiceType = 'water' | 'waiter' | 'napkins';

export interface ServiceCooldownState {
  type: ServiceType;
  label: string;
  activeUntil: number | null;
  remainingSeconds: number;
  requestCount: number;
}

export type SplitMode = 'full' | 'equal' | 'items';

export type UpiProvider = 'gpay' | 'phonepe' | 'paytm';

export interface PaymentRecord {
  id: string;
  reference: string;
  timestamp: string;
  mode: SplitMode;
  provider: UpiProvider;
  amount: number;
  subtotalPaid: number;
  gstPaid: number;
  guestCount?: number;
  paidItemIds: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type: 'emerald' | 'amber' | 'info' | 'forest' | 'brass';
}

export interface ReviewSubmission {
  rating: number;
  submittedAt?: string;
  feedbackText?: string;
  issueCategory?: string;
  couponCode?: string;
  privateSubmitted?: boolean;
}
