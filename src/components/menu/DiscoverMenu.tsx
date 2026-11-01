import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, UtensilsCrossed, X } from 'lucide-react';
import { MENU_CATEGORIES, MENU_DISHES } from '../../data/menuData';
import { MenuCategory } from '../../types';
import { DishCard } from './DishCard';

export type DietaryFilter = 'all' | 'veg' | 'non-veg' | 'chef-special';

const DIETARY_FILTERS: {
  id: DietaryFilter;
  label: string;
  dotColor?: string;
}[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'veg', label: 'Pure Veg', dotColor: 'bg-forest' },
  { id: 'non-veg', label: 'Non-Veg', dotColor: 'bg-burgundy' },
  { id: 'chef-special', label: "Chef's Special" },
];

export const DiscoverMenu: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('all');
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory>('Starters');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isProgrammaticScroll = useRef(false);

  // Filter dishes by search query and dietary filter
  const filteredDishes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MENU_DISHES.filter((dish) => {
      if (dietaryFilter === 'veg' && dish.dietary !== 'veg') return false;
      if (dietaryFilter === 'non-veg' && dish.dietary !== 'non-veg')
        return false;
      if (dietaryFilter === 'chef-special' && !dish.isChefSpecial) return false;

      if (!q) return true;

      const matchesName = dish.name.toLowerCase().includes(q);
      const matchesDesc = dish.description.toLowerCase().includes(q);
      const matchesCategory = dish.category.toLowerCase().includes(q);
      const matchesIngredients = dish.ingredients.some((ing) =>
        ing.toLowerCase().includes(q)
      );

      return (
        matchesName || matchesDesc || matchesCategory || matchesIngredients
      );
    });
  }, [searchQuery, dietaryFilter]);

  const groupedByCategory = useMemo(() => {
    return MENU_CATEGORIES.map((category) => ({
      category,
      dishes: filteredDishes.filter((d) => d.category === category),
    })).filter((group) => group.dishes.length > 0);
  }, [filteredDishes]);

  // Update active category tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      const scrollOffset = window.scrollY + 180;
      let currentCat: MenuCategory = activeCategory;

      for (const category of MENU_CATEGORIES) {
        const el = sectionRefs.current[category];
        if (el) {
          const top = el.offsetTop;
          if (scrollOffset >= top) {
            currentCat = category;
          }
        }
      }

      if (currentCat !== activeCategory) {
        setActiveCategory(currentCat);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const scrollToCategory = (category: MenuCategory) => {
    setActiveCategory(category);
    const el = sectionRefs.current[category];
    if (el) {
      isProgrammaticScroll.current = true;
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  };

  return (
    <section aria-label="Discover Menu" className="pt-4 pb-56 sm:pb-48 bg-porcelain">
      {/* Search & Dietary Filters */}
      <div className="px-4 sm:px-6 md:px-8 space-y-3">
        {/* Minimal Search Input with Fine Border */}
        <div className="relative">
          <Search className="w-4 h-4 text-warm-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search truffle, burrata, prawns, mocktails..."
            aria-label="Search menu by dish, ingredient, or category"
            data-testid="menu-search-input"
            className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-xl bg-cream border border-taupe focus:border-olive focus:outline-none text-[13px] sm:text-[13.5px] text-espresso placeholder:text-warm-grey shadow-subtle transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-taupe/40 text-stone hover:text-espresso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dietary Filter Segmented Chips */}
        <div
          role="tablist"
          aria-label="Dietary filters"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          {DIETARY_FILTERS.map((filter) => {
            const isActive = dietaryFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`filter-${filter.id}`}
                onClick={() => setDietaryFilter(filter.id)}
                className={`shrink-0 h-8 px-3 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-olive text-cream font-semibold shadow-subtle'
                    : 'bg-cream text-warm-grey border border-taupe hover:text-espresso hover:border-warm-grey'
                }`}
              >
                {filter.dotColor && (
                  <span
                    className={`w-2 h-2 rounded-full ${filter.dotColor}`}
                  />
                )}
                {filter.id === 'chef-special' && (
                  <Sparkles
                    className={`w-3 h-3 ${
                      isActive ? 'text-cream' : 'text-brass-dark'
                    }`}
                  />
                )}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Horizontally Scrollable Category Navigation */}
      <div className="sticky top-0 z-30 mt-4 luxury-blur-header border-y border-taupe px-4 sm:px-6 md:px-8 py-2.5">
        <nav
          aria-label="Menu Categories"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
          {MENU_CATEGORIES.map((category) => {
            const isCurrent = activeCategory === category;
            const count = filteredDishes.filter(
              (d) => d.category === category
            ).length;

            return (
              <button
                key={category}
                type="button"
                data-testid={`category-tab-${category}`}
                onClick={() => scrollToCategory(category)}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[12.5px] transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-olive text-cream font-semibold shadow-subtle'
                    : 'text-warm-grey hover:text-espresso font-medium'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full ${
                    isCurrent
                      ? 'bg-cream/20 text-cream'
                      : 'bg-taupe/50 text-stone'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Menu Sections or Empty State */}
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        {groupedByCategory.length === 0 ? (
          <div
            data-testid="empty-search-state"
            className="my-10 rounded-2xl bg-cream border border-taupe p-8 text-center max-w-md mx-auto shadow-subtle"
          >
            <div className="w-12 h-12 rounded-xl bg-ivory border border-taupe flex items-center justify-center mx-auto mb-3 text-warm-grey">
              <UtensilsCrossed className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="text-[17px] font-semibold text-espresso">
              No matching culinary dishes
            </h3>
            <p className="text-[12.5px] text-warm-grey mt-1.5 max-w-[280px] mx-auto leading-relaxed">
              We couldn&apos;t find any dishes matching &ldquo;{searchQuery}&rdquo; with your selected dietary filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
              }}
              className="mt-5 px-4 py-2 rounded-lg bg-olive text-cream text-[12px] font-semibold hover:bg-olive-hover transition-colors shadow-subtle"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {groupedByCategory.map(({ category, dishes }) => (
              <div
                key={category}
                ref={(el) => {
                  sectionRefs.current[category] = el;
                }}
                data-testid={`section-${category}`}
                className="scroll-mt-32"
              >
                {/* Section Header: Editorial Display Typography */}
                <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-taupe">
                  <h2 className="font-serif text-[24px] sm:text-[28px] font-medium tracking-wide text-espresso">
                    {category}
                  </h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-stone tabular-nums">
                    {dishes.length} {dishes.length === 1 ? 'Selection' : 'Selections'}
                  </span>
                </div>

                {/* Dish Grid: Single column on mobile, 2-column editorial on tablet/larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 md:gap-y-6 divide-y divide-taupe md:divide-y-0">
                  {dishes.map((dish, idx) => (
                    <DishCard key={dish.id} dish={dish} index={idx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
