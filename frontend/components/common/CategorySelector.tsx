'use client';

import { Bus, Megaphone, ShoppingCart, Film, Plane } from 'lucide-react';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: 'bus-station', name: 'Bus Station', icon: <Bus className="w-6 h-6" /> },
  { id: 'billboard', name: 'Billboard', icon: <Megaphone className="w-6 h-6" /> },
  { id: 'pos', name: 'Point of Sale', icon: <ShoppingCart className="w-6 h-6" /> },
  { id: 'cinema', name: 'Cinema Screens', icon: <Film className="w-6 h-6" /> },
  { id: 'airport', name: 'Airport', icon: <Plane className="w-6 h-6" /> },
];

export default function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(
            selectedCategory === category.id ? null : category.id
          )}
          className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl transition-all active:scale-95 ${
            selectedCategory === category.id
              ? 'bg-[#E91E63] text-white card-shadow'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          <div className={selectedCategory === category.id ? 'text-white' : 'text-gray-700'}>
            {category.icon}
          </div>
          <span className={`text-[11px] font-medium ${selectedCategory === category.id ? 'text-white' : 'text-gray-700'}`}>
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
}

