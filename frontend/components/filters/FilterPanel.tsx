'use client';

import { useState, useEffect } from 'react';
import { X, Zap, IndianRupee, MapPin, Volume2, Building2, Target, ArrowUp } from 'lucide-react';
import { getPublishers } from '@/lib/supabase/services';

interface FilterState {
  priceRange: { min: number; max: number };
  footfallRange: { min: number; max: number };
  sortBy: 'none' | 'price_low' | 'price_high' | 'footfall_low' | 'footfall_high';
  location?: string;
  locationCategories?: string[]; // Array of selected location category IDs
  displayType?: string;
  publisher?: string;
  publishers?: string[]; // Array of selected publisher IDs
  purchaseCategories?: string[]; // Array of selected purchase category IDs
  audienceTypes?: string[]; // Array of selected audience type IDs
  affluenceTiers?: string[]; // Array of selected affluence tier IDs
  ageGroups?: string[]; // Array of selected age group IDs
  weekBias?: string[]; // Array of selected week bias IDs
  spendLevels?: string[]; // Array of selected spend level IDs
}

interface LocationCategory {
  id: string;
  name: string;
  subcategoryCount: number;
  subcategories: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const filterCategories = [
  { id: 'quick', label: 'Quick Filters', icon: Zap },
  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'display', label: 'Display', icon: Volume2 },
  { id: 'publishers', label: 'Publishers', icon: Building2 },
  { id: 'audience', label: 'Audience', icon: Target, pro: true },
];

// Publishers will be fetched from database

// Location Categories Data
const locationCategories: LocationCategory[] = [
  {
    id: 'roadside-public',
    name: 'Roadside & Public Spaces',
    subcategoryCount: 6,
    subcategories: ['Highway Billboards', 'Street Furniture', 'Bus Stops', 'Traffic Signals', 'Public Parks', 'Pedestrian Zones']
  },
  {
    id: 'transit-travel',
    name: 'Transit & Travel',
    subcategoryCount: 6,
    subcategories: ['Metro Stations', 'Railway Stations', 'Airports', 'Bus Terminals', 'Taxi Stands', 'Parking Lots']
  },
  {
    id: 'malls-retail',
    name: 'Enclosed Malls & Retail',
    subcategoryCount: 7,
    subcategories: ['Shopping Malls', 'Retail Stores', 'Supermarkets', 'Food Courts', 'Cinema Halls', 'Entertainment Zones', 'Atriums']
  },
  {
    id: 'corporate-office',
    name: 'Corporate & Office Campuses',
    subcategoryCount: 6,
    subcategories: ['Office Buildings', 'Business Parks', 'Corporate Lobbies', 'Elevators', 'Cafeterias', 'Conference Rooms']
  },
  {
    id: 'lifestyle-hospitality',
    name: 'Lifestyle, Hospitality & Venues',
    subcategoryCount: 10,
    subcategories: ['Hotels', 'Restaurants', 'Bars & Clubs', 'Spas & Wellness', 'Gyms', 'Sports Venues', 'Event Spaces', 'Lounges', 'Casinos', 'Resorts']
  },
  {
    id: 'residential',
    name: 'Residential Societies',
    subcategoryCount: 6,
    subcategories: ['Apartment Buildings', 'Gated Communities', 'Clubhouses', 'Elevators', 'Common Areas', 'Parking Areas']
  },
  {
    id: 'healthcare-education',
    name: 'Healthcare & Education',
    subcategoryCount: 7,
    subcategories: ['Hospitals', 'Clinics', 'Pharmacy Chains', 'Medical Centers', 'Universities', 'Colleges', 'Schools']
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    subcategoryCount: 1,
    subcategories: ['Other Locations']
  }
];

export default function FilterPanel({ isOpen, onClose, onApply, initialFilters }: FilterPanelProps) {
  const [activeCategory, setActiveCategory] = useState('pricing');
  const [publishers, setPublishers] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Fetch publishers from database - use Next.js API route
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        let pubs = [];
        
        try {
          // Use Next.js API route (built into the app)
          const response = await fetch('/api/publishers');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              pubs = result.data;
              console.log('✅ Fetched', pubs.length, 'publishers via API route');
            } else {
              throw new Error('API route returned unsuccessful response');
            }
          } else {
            throw new Error(`API route returned ${response.status}`);
          }
        } catch (apiError) {
          console.warn('⚠️ API route failed, trying direct service:', apiError);
          // Fallback to direct service call
          pubs = await getPublishers();
          console.log('✅ Fetched', pubs.length, 'publishers via direct service');
        }
        
        setPublishers(pubs.map((pub: any) => ({
          id: pub.id,
          name: pub.name,
          description: pub.description || ''
        })));
      } catch (error) {
        console.error('Error fetching publishers:', error);
      }
    };
    if (isOpen) {
      fetchPublishers();
    }
  }, [isOpen]);

  // Fetch categories from database for location section
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Get parent categories (for location filtering)
            const parentCategories = result.data.filter((cat: any) => cat.parent_category_id === null);
            setDbCategories(parentCategories);
            console.log('✅ Fetched', parentCategories.length, 'parent categories for location filter');
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (isOpen && activeCategory === 'location') {
      fetchCategories();
    }
  }, [isOpen, activeCategory]);

  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    priceRange: { min: 0, max: 100000 },
    footfallRange: { min: 0, max: 1000000 },
    sortBy: 'none',
    locationCategories: [],
    publishers: [],
    purchaseCategories: [],
    audienceTypes: [],
    affluenceTiers: [],
    ageGroups: [],
    weekBias: [],
    spendLevels: [],
  });

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      priceRange: { min: 0, max: 100000 },
      footfallRange: { min: 0, max: 1000000 },
      sortBy: 'none',
      locationCategories: [],
      publishers: [],
      purchaseCategories: [],
      audienceTypes: [],
      affluenceTiers: [],
      ageGroups: [],
      weekBias: [],
      spendLevels: [],
    };
    setFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const renderFilterContent = () => {
    switch (activeCategory) {
      case 'pricing':
        return (
          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#E91E63]" />
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Min Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="₹ 0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Max Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="₹ 100000"
                  />
                </div>
              </div>
            </div>

            {/* Average Daily Footfall */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <span className="text-[#E91E63] text-xs">👥</span>
                </div>
                Average Daily Footfall
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Min Footfall</label>
                  <input
                    type="number"
                    value={filters.footfallRange.min}
                    onChange={(e) => setFilters({
                      ...filters,
                      footfallRange: { ...filters.footfallRange, min: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Max Footfall</label>
                  <input
                    type="number"
                    value={filters.footfallRange.max}
                    onChange={(e) => setFilters({
                      ...filters,
                      footfallRange: { ...filters.footfallRange, max: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="1000000"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Filter adboards by average daily visitor count
              </p>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-[#E91E63]" />
                Sort Options
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'none', label: 'No sorting' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'footfall_low', label: 'Footfall: Low to High' },
                  { value: 'footfall_high', label: 'Footfall: High to Low' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => setFilters({
                        ...filters,
                        sortBy: e.target.value as FilterState['sortBy']
                      })}
                      className="w-4 h-4 accent-[#E91E63]"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E91E63]" />
                Location Categories
              </h3>
              <p className="text-xs text-gray-500">
                Select categories to filter ad spaces. Parent categories include all their child categories.
              </p>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {dbCategories.length > 0 ? (
                dbCategories.map((category) => {
                  const isSelected = filters.locationCategories?.includes(category.id) || false;
                  // Count child categories
                  const childCount = dbCategories.filter((c: any) => c.parent_category_id === category.id).length;
                  return (
                    <label
                      key={category.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#E91E63] bg-[#E91E63]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentCategories = filters.locationCategories || [];
                          const newCategories = e.target.checked
                            ? [...currentCategories, category.id]
                            : currentCategories.filter(id => id !== category.id);
                          setFilters({
                            ...filters,
                            locationCategories: newCategories
                          });
                        }}
                        className="w-4 h-4 mt-0.5 accent-[#E91E63] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 mb-0.5">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category.ad_space_count || 0} spaces
                          {childCount > 0 && ` • ${childCount} subcategories`}
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 p-4 text-center">
                  Loading categories...
                </div>
              )}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Display Type</h3>
            <div className="space-y-2">
              {[
                { label: 'Static Billboard', value: 'static_billboard' },
                { label: 'Digital Screen', value: 'digital_screen' },
                { label: 'LED Display', value: 'led_display' },
                { label: 'Backlit Panel', value: 'backlit_panel' },
                { label: 'Vinyl Banner', value: 'vinyl_banner' },
                { label: 'Transit Branding', value: 'transit_branding' },
                { label: 'Auto Rickshaw', value: 'auto_rickshaw' },
                { label: 'Bike', value: 'bike' },
                { label: 'Cab', value: 'cab' },
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="displayType"
                    checked={filters.displayType === type.value}
                    onChange={() => setFilters({
                      ...filters,
                      displayType: filters.displayType === type.value ? undefined : type.value
                    })}
                    className="w-4 h-4 accent-[#E91E63]"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'quick':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Under ₹50K', priceMax: 50000 },
                { label: 'High Traffic', footfallMin: 10000 },
                { label: 'Premium', priceMin: 50000 },
                { label: 'Budget', priceMax: 25000 },
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => {
                    if (filter.priceMax) {
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: filter.priceMax }
                      });
                    } else if (filter.footfallMin) {
                      setFilters({
                        ...filters,
                        footfallRange: { ...filters.footfallRange, min: filter.footfallMin! }
                      });
                    } else if (filter.priceMin) {
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: filter.priceMin! }
                      });
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#E91E63] hover:text-[#E91E63] transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'publishers':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#E91E63]" />
                Publishers
              </h3>
              <p className="text-xs text-gray-500">
                Filter ad spaces by publisher network
              </p>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {publishers.map((publisher) => {
                const isSelected = filters.publishers?.includes(publisher.id) || false;
                return (
                  <label
                    key={publisher.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#E91E63] bg-[#E91E63]/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentPublishers = filters.publishers || [];
                        const newPublishers = e.target.checked
                          ? [...currentPublishers, publisher.id]
                          : currentPublishers.filter(id => id !== publisher.id);
                        setFilters({
                          ...filters,
                          publishers: newPublishers
                        });
                      }}
                      className="w-4 h-4 mt-0.5 accent-[#E91E63] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 mb-0.5">
                        {publisher.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {publisher.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E91E63]" />
                Target Audience
              </h3>
            </div>

            {/* Purchase Categories */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Purchase Categories
              </h4>
              <div className="space-y-2">
                {[
                  'Premium F&B',
                  'Kids Activities',
                  'Fintech',
                  'Health & Wellness',
                  'EVs',
                  'Home Upgrades',
                  'Travel',
                  'Fashion',
                  'EdTech',
                ].map((category) => {
                  const isSelected = filters.purchaseCategories?.includes(category) || false;
                  return (
                    <label
                      key={category}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentCategories = filters.purchaseCategories || [];
                          const newCategories = e.target.checked
                            ? [...currentCategories, category]
                            : currentCategories.filter(c => c !== category);
                          setFilters({
                            ...filters,
                            purchaseCategories: newCategories
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Audience Types */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Audience Types
              </h4>
              <div className="space-y-2">
                {[
                  'Residential',
                  'Corporate',
                  'Shoppers',
                  'Travelers',
                  'Students',
                  'Event Goers',
                  'Patients',
                  'VIP Audience',
                  'Other',
                ].map((type) => {
                  const isSelected = filters.audienceTypes?.includes(type) || false;
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentTypes = filters.audienceTypes || [];
                          const newTypes = e.target.checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          setFilters({
                            ...filters,
                            audienceTypes: newTypes
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Affluence Tiers */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Affluence Tiers
              </h4>
              <div className="space-y-2">
                {[
                  'Mass',
                  'Mass Affluent',
                  'Affluent',
                  'HNI',
                  'Ultra HNI',
                ].map((tier) => {
                  const isSelected = filters.affluenceTiers?.includes(tier) || false;
                  return (
                    <label
                      key={tier}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentTiers = filters.affluenceTiers || [];
                          const newTiers = e.target.checked
                            ? [...currentTiers, tier]
                            : currentTiers.filter(t => t !== tier);
                          setFilters({
                            ...filters,
                            affluenceTiers: newTiers
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{tier}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Age Groups */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Age Groups
              </h4>
              <div className="space-y-2">
                {[
                  'Minor',
                  'Adult',
                  'Senior',
                ].map((ageGroup) => {
                  const isSelected = filters.ageGroups?.includes(ageGroup) || false;
                  return (
                    <label
                      key={ageGroup}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentAgeGroups = filters.ageGroups || [];
                          const newAgeGroups = e.target.checked
                            ? [...currentAgeGroups, ageGroup]
                            : currentAgeGroups.filter(a => a !== ageGroup);
                          setFilters({
                            ...filters,
                            ageGroups: newAgeGroups
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{ageGroup}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Week Bias */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Week Bias
              </h4>
              <div className="space-y-2">
                {[
                  'Weekday Higher',
                  'Weekend Higher',
                  'Same',
                ].map((bias) => {
                  const isSelected = filters.weekBias?.includes(bias) || false;
                  return (
                    <label
                      key={bias}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentBias = filters.weekBias || [];
                          const newBias = e.target.checked
                            ? [...currentBias, bias]
                            : currentBias.filter(b => b !== bias);
                          setFilters({
                            ...filters,
                            weekBias: newBias
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{bias}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Spend Levels */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Spend Levels
              </h4>
              <div className="space-y-2">
                {[
                  'Low',
                  'Medium',
                  'High',
                ].map((level) => {
                  const isSelected = filters.spendLevels?.includes(level) || false;
                  return (
                    <label
                      key={level}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E91E63]/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentLevels = filters.spendLevels || [];
                          const newLevels = e.target.checked
                            ? [...currentLevels, level]
                            : currentLevels.filter(l => l !== level);
                          setFilters({
                            ...filters,
                            spendLevels: newLevels
                          });
                        }}
                        className="w-4 h-4 accent-[#E91E63]"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 text-sm">
            Filter options coming soon
          </div>
        );
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E91E63]/10 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#E91E63]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">All Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-48 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filterCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#E91E63]/10 text-[#E91E63]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E91E63]' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{category.label}</span>
                    {category.pro && (
                      <span className="text-[10px] bg-[#E91E63] text-white px-1.5 py-0.5 rounded">Pro</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderFilterContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-[#E91E63] text-white rounded-lg text-sm font-medium hover:bg-[#F50057] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

