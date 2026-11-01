import React from 'react';
import { motion } from 'framer-motion';
import { TableSessionProvider } from './context/TableSessionContext';
import { InstantServiceStrip } from './components/service/InstantServiceStrip';
import { DiscoverMenu } from './components/menu/DiscoverMenu';
import { CustomizationSheet } from './components/menu/CustomizationSheet';
import { FloatingBottomDock } from './components/cart/FloatingBottomDock';
import { OrderTrackerModal } from './components/orders/OrderTrackerModal';
import { CheckoutDrawer } from './components/checkout/CheckoutDrawer';
import { ReviewShieldModal } from './components/review/ReviewShieldModal';
import { ToastContainer } from './components/ui/ToastContainer';

export function App() {
  return (
    <TableSessionProvider>
      {/* Surrounding Warm Ivory Architectural Canvas on Desktop/Tablet, Full-Bleed on Mobile */}
      <div className="min-h-[100dvh] w-full bg-ivory flex justify-center selection:bg-olive/20 selection:text-espresso relative">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl min-h-[100dvh] sm:my-0 md:my-6 sm:rounded-none md:rounded-3xl bg-porcelain text-espresso sm:border-x md:border md:border-taupe sm:shadow-none md:shadow-elevated overflow-x-hidden"
        >
          {/* 1. Silent Instant Table Concierge */}
          <InstantServiceStrip />

          {/* 2. Food Magazine Discovery Menu (Fluid on mobile, 2-column grid on tablet) */}
          <DiscoverMenu />

          {/* 3. Refined Floating Bill & Active Cart Dock */}
          <FloatingBottomDock />
        </motion.main>

        {/* Global Toast System (Top-level Portal Stacking) */}
        <ToastContainer />

        {/* Global Luxury Drawers & Modals (Top-level Stacking to prevent transform clipping) */}
        <CustomizationSheet />
        <OrderTrackerModal />
        <CheckoutDrawer />
        <ReviewShieldModal />
      </div>
    </TableSessionProvider>
  );
}

export default App;
