'use client';

import { Home, Search, ShoppingCart, Sparkles, Palette, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useFilterStore } from '@/store/useFilterStore';

export default function Sidebar() {
  const pathname = usePathname();
  const cart = useCartStore((state) => state.items);
  const { isOpen: filtersOpen, openFilters } = useFilterStore();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: cart.length },
    { icon: Sparkles, label: 'AI Planner', href: '/ai-planner' },
    { icon: Palette, label: 'Design Studio', href: '/design', comingSoon: true },
  ];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-8">
      <div className="text-xl font-bold text-[#E91E63]">Elfsod</div>
      
      <nav className="flex-1 flex flex-col items-center space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#E91E63] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={item.comingSoon ? `${item.label} - Coming Soon` : item.label}
            >
              <Icon className="w-6 h-6" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
        
        {/* Filters Button - Below Design Studio */}
        <button
          onClick={openFilters}
          className={`relative p-3 rounded-xl transition-all ${
            filtersOpen
              ? 'bg-[#E91E63] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Filters"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

