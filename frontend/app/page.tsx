'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Sparkles, Palette, Wand2, TrendingUp, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import AdSpaceCard from '@/components/common/AdSpaceCard';
import FilterPanel from '@/components/filters/FilterPanel';
import { AdSpace } from '@/types';
import { getAdSpaces, getCategories } from '@/lib/supabase/services';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import { useFilterStore } from '@/store/useFilterStore';
import Link from 'next/link';
import { getCategoryIcon } from '@/lib/utils/categoryIcons';

interface FilterState {
  priceRange: { min: number; max: number };
  footfallRange: { min: number; max: number };
  sortBy: 'none' | 'price_low' | 'price_high' | 'footfall_low' | 'footfall_high';
  location?: string;
  locationCategories?: string[];
  displayType?: string;
  publisher?: string;
  publishers?: string[];
  purchaseCategories?: string[];
  audienceTypes?: string[];
  affluenceTiers?: string[];
  ageGroups?: string[];
  weekBias?: string[];
  spendLevels?: string[];
}

export default function HomePage() {
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [filteredAdSpaces, setFilteredAdSpaces] = useState<AdSpace[]>([]);
  const [recommendedSpaces, setRecommendedSpaces] = useState<AdSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: showFilters, closeFilters } = useFilterStore();
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const selectedCity = useLocationStore((state) => state.selectedCity);
  const { startDate, endDate } = useCampaignDatesStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdSpaces();
    fetchRecommendedSpaces();
  }, [selectedCity]); // Refetch when city changes

  // Filter ad spaces when dates or filters change
  useEffect(() => {
    if (adSpaces.length > 0) {
      let filtered = [...adSpaces]; // Start with all ad spaces
      
      // City filter is already applied in fetchAdSpaces, so we don't need to filter again
      
      // Filter by availability dates if dates are selected
      // Note: In a real app, you'd check against bookings table
      // For now, we'll just filter by availability_status
      if (startDate && endDate) {
        // Filter spaces that are available
        filtered = filtered.filter(space => 
          space.availability_status === 'available'
        );
      }
      
      // Apply additional filters
      if (appliedFilters) {
        // Price range filter
        filtered = filtered.filter(space =>
          space.price_per_day >= appliedFilters.priceRange.min &&
          space.price_per_day <= appliedFilters.priceRange.max
        );
        
        // Footfall range filter
        filtered = filtered.filter(space =>
          space.daily_impressions >= appliedFilters.footfallRange.min &&
          space.daily_impressions <= appliedFilters.footfallRange.max
        );
        
        // Location filter (if different from selected city)
        if (appliedFilters.location && appliedFilters.location !== selectedCity) {
          filtered = filtered.filter(space =>
            space.location?.city === appliedFilters.location
          );
        }
        
        // Display type filter
        if (appliedFilters.displayType) {
          filtered = filtered.filter(space =>
            space.display_type === appliedFilters.displayType
          );
        }
        
        // Publishers filter
        if (appliedFilters.publishers && appliedFilters.publishers.length > 0) {
          filtered = filtered.filter(space =>
            appliedFilters.publishers!.includes(space.publisher_id)
          );
        }
        
        // Sort
        if (appliedFilters.sortBy !== 'none') {
          filtered = [...filtered].sort((a, b) => {
            switch (appliedFilters.sortBy) {
              case 'price_low':
                return a.price_per_day - b.price_per_day;
              case 'price_high':
                return b.price_per_day - a.price_per_day;
              case 'footfall_low':
                return a.daily_impressions - b.daily_impressions;
              case 'footfall_high':
                return b.daily_impressions - a.daily_impressions;
              default:
                return 0;
            }
          });
        }
      }
      
      setFilteredAdSpaces(filtered.length > 0 ? filtered : adSpaces);
    } else {
      // If no ad spaces loaded yet, set empty array
      setFilteredAdSpaces([]);
    }
  }, [adSpaces, appliedFilters, startDate, endDate]);

  // Fetch recommended high traffic spaces independently (not affected by filters)
  const fetchRecommendedSpaces = async () => {
    try {
      const params = new URLSearchParams();
      params.append('availabilityStatus', 'available');
      params.append('limit', '50'); // Get more to filter for high traffic
      
      // Optionally filter by city, but keep it separate from main filters
      if (selectedCity) {
        params.append('city', selectedCity);
      }

      const response = await fetch(`/api/ad-spaces?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Filter and sort for high traffic spaces
          const highTrafficSpaces = result.data
            .filter((space: AdSpace) => {
              const trafficLevel = space.traffic_data?.traffic_level;
              const nearbyPlaces = space.traffic_data?.nearby_places_count;
              
              // Check if traffic level is high or very_high
              if (trafficLevel === 'high' || trafficLevel === 'very_high') {
                return true;
              }
              
              // Also include spaces with high nearby places count (estimated high traffic)
              if (nearbyPlaces && nearbyPlaces > 20) {
                return true;
              }
              
              // Include spaces with high daily impressions as proxy for traffic
              if (space.daily_impressions && space.daily_impressions > 10000) {
                return true;
              }
              
              return false;
            })
            .filter((space: AdSpace) => space.availability_status === 'available')
            .sort((a: AdSpace, b: AdSpace) => {
              // Sort by traffic level priority, then by daily impressions
              const getTrafficScore = (space: AdSpace) => {
                const level = space.traffic_data?.traffic_level;
                if (level === 'very_high') return 100;
                if (level === 'high') return 80;
                if (level === 'moderate') return 50;
                if (level === 'low') return 20;
                
                // Fallback to impressions or nearby places
                if (space.daily_impressions && space.daily_impressions > 15000) return 70;
                if (space.daily_impressions && space.daily_impressions > 10000) return 60;
                if (space.traffic_data?.nearby_places_count && space.traffic_data.nearby_places_count > 20) return 65;
                
                return 30;
              };
              
              const scoreA = getTrafficScore(a);
              const scoreB = getTrafficScore(b);
              
              if (scoreA !== scoreB) {
                return scoreB - scoreA; // Higher score first
              }
              
              // If same score, sort by daily impressions
              return (b.daily_impressions || 0) - (a.daily_impressions || 0);
            })
            .slice(0, 6); // Show top 6 high traffic spaces
          
          setRecommendedSpaces(highTrafficSpaces);
        }
      }
    } catch (error) {
      console.error('Error fetching recommended spaces:', error);
      setRecommendedSpaces([]);
    }
  };

  const fetchAdSpaces = async () => {
    setLoading(true);
    try {
      const filters: any = {
        availabilityStatus: 'available',
      };

      if (selectedCity) {
        filters.city = selectedCity;
      }

      console.log('🔍 Fetching ad spaces with filters:', filters);
      
      // Use Next.js API route (server-side, no CORS issues)
      let spaces: AdSpace[] = [];
      
      try {
        // Use Next.js API route (built into the app)
        const params = new URLSearchParams();
        if (filters.city) params.append('city', filters.city);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.publisherId) {
          const publisherIds = Array.isArray(filters.publisherId) 
            ? filters.publisherId.join(',') 
            : filters.publisherId;
          params.append('publisherId', publisherIds);
        }
        if (filters.displayType) params.append('displayType', filters.displayType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.minFootfall) params.append('minFootfall', filters.minFootfall.toString());
        if (filters.maxFootfall) params.append('maxFootfall', filters.maxFootfall.toString());
        if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
        if (filters.availabilityStatus) params.append('availabilityStatus', filters.availabilityStatus);
        params.append('limit', '100');

        // Try Next.js API route first, fallback to direct service
        try {
          const response = await fetch(`/api/ad-spaces?${params.toString()}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              spaces = result.data;
              console.log('✅ Fetched', spaces.length, 'ad spaces via Next.js API route:', spaces);
            } else {
              throw new Error('Next.js API route returned unsuccessful response');
            }
          } else {
            throw new Error(`Next.js API route returned ${response.status}`);
          }
        } catch (apiError) {
          console.warn('⚠️ Next.js API route failed, trying direct service:', apiError);
          try {
            // Fallback to direct Supabase service call (browser-side)
            console.log('🔄 Attempting browser-side direct connection...');
            spaces = await getAdSpaces(filters);
            console.log('✅ Fetched', spaces.length, 'ad spaces via direct service:', spaces);
          } catch (directError) {
            console.error('❌ All connection methods failed:', directError);
            console.error('Error details:', {
              message: directError instanceof Error ? directError.message : String(directError),
              name: directError instanceof Error ? directError.name : 'Unknown',
            });
            
            // Check if it's a CORS error
            const errorMessage = directError instanceof Error ? directError.message : String(directError);
            if (errorMessage.includes('CORS') || errorMessage.includes('cors') || errorMessage.includes('Access-Control')) {
              console.error('🚫 CORS Error detected! Supabase may be blocking browser requests.');
              console.error('💡 Solution: Configure CORS in Supabase dashboard or check project status.');
            }
            
            throw directError;
          }
        }
        
        setAdSpaces(spaces);
        setFilteredAdSpaces(spaces);
      } catch (error) {
        console.error('❌ Error fetching ad spaces:', error);
        setAdSpaces([]);
        setFilteredAdSpaces([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from database - use Next.js API route
  // Refetch when city changes to update counts
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        let cats = [];
        
        try {
          // Use Next.js API route with city parameter for accurate counts
          // Logic: category + location = count of cards that will show
          const url = selectedCity 
            ? `/api/categories?city=${encodeURIComponent(selectedCity)}`
            : '/api/categories';
          
          const response = await fetch(url);
          const result = await response.json();
          
          // Check if API route indicates fallback should be used
          if (result.fallback === true) {
            console.warn('⚠️ API route indicates fallback needed:', result.error || result.message);
            throw new Error('Server-side connection failed, using browser fallback');
          }
          
          if (response.ok && result.success && result.data) {
            cats = result.data;
            console.log('✅ Fetched', cats.length, 'categories via API route', selectedCity ? `for ${selectedCity}` : '');
          } else {
            throw new Error(result.error || 'API route returned unsuccessful response');
          }
        } catch (apiError) {
          console.warn('⚠️ API route failed, trying direct service:', apiError);
          // Fallback to direct service call (browser-side)
          try {
            console.log('🔄 Attempting browser-side direct connection to Supabase...');
            cats = await getCategories();
            console.log('✅ Fetched', cats.length, 'categories via direct browser service');
          } catch (directError) {
            console.error('❌ Both API route and direct service failed:', directError);
            const errorMessage = directError instanceof Error ? directError.message : String(directError);
            if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
              console.error('🚫 CORS Error: Supabase may be blocking browser requests');
              console.error('💡 Check: 1) Supabase project is active, 2) CORS settings in Supabase dashboard');
            }
            cats = [];
          }
        }

        // Map category names to emojis
        const getCategoryEmoji = (name: string): string => {
          const nameLower = name.toLowerCase();
          if (nameLower.includes('billboard')) return '📢';
          if (nameLower.includes('bus')) return '🚌';
          if (nameLower.includes('cinema') || nameLower.includes('film')) return '🎬';
          if (nameLower.includes('digital') || nameLower.includes('screen')) return '📺';
          if (nameLower.includes('pos') || nameLower.includes('point of sale') || nameLower.includes('retail')) return '🛒';
          if (nameLower.includes('transit') || nameLower.includes('metro') || nameLower.includes('train')) return '🚇';
          if (nameLower.includes('airport')) return '✈️';
          if (nameLower.includes('corporate') || nameLower.includes('office')) return '🏢';
          if (nameLower.includes('cafe') || nameLower.includes('restaurant')) return '☕';
          if (nameLower.includes('auto') || nameLower.includes('rickshaw')) return '🛺';
          if (nameLower.includes('mall')) return '🏬';
          return '📍'; // Default emoji
        };

        setCategories(cats.map((cat: any) => {
          // Get local icon first, fallback to database icon_url
          const localIcon = getCategoryIcon(cat.name, cat.icon_url);
          
          return {
            id: cat.id,
            name: cat.name,
            count: cat.ad_space_count || 0, // Use count from API (already filtered by location)
            parent_category_id: cat.parent_category_id || null, // Store parent_category_id to detect parent categories
            icon: null, // Can be added later
            emoji: getCategoryEmoji(cat.name), // Emoji fallback
            icon_url: localIcon || cat.icon_url, // Use local icon first, then database icon_url
            color: 'from-gray-600 to-gray-700',
            bgColor: 'bg-gray-50'
          };
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [selectedCity]); // Refetch categories when city changes to update counts

  // Organize categories: separate parents and children for visual distinction
  const parentCategories = categories.filter(cat => !cat.parent_category_id);
  const childCategories = categories.filter(cat => cat.parent_category_id);
  
  // Group children by parent (for showing child count on parent cards)
  const childrenByParent = childCategories.reduce((acc, child) => {
    const parentId = child.parent_category_id;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(child);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Use categories from database with updated counts
  const displayCategories = categories.length > 0 ? categories : [];

  const handleCategoryClick = async (categoryId: string, categoryName?: string) => {
    setLoading(true);
    
    // Toggle category selection
    let newSelectedCategories: string[];
    if (selectedCategories.includes(categoryId)) {
      // Deselect category
      newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      // Add category to selection
      newSelectedCategories = [...selectedCategories, categoryId];
    }
    
    setSelectedCategories(newSelectedCategories);
    
    try {
      // If no categories selected, show all ad spaces
      if (newSelectedCategories.length === 0) {
        await fetchAdSpaces();
        console.log('✅ All categories deselected - showing all ad spaces');
        return;
      }
      
      // Filter by multiple categories using categoryIds (API supports comma-separated IDs)
      const params = new URLSearchParams();
      
      // Use categoryIds for multiple selection (API already supports this)
      if (newSelectedCategories.length > 0) {
        params.append('categoryIds', newSelectedCategories.join(','));
      }
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      params.append('availabilityStatus', 'available');
      params.append('limit', '100');

      const response = await fetch(`/api/ad-spaces/filter?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAdSpaces(result.data);
          setFilteredAdSpaces(result.data);
          console.log('✅ Filtered', result.data.length, 'ad spaces by', newSelectedCategories.length, 'categories');
        } else {
          console.warn('⚠️ No ad spaces found for selected categories');
          setAdSpaces([]);
          setFilteredAdSpaces([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Filter API error:', errorData);
        setAdSpaces([]);
        setFilteredAdSpaces([]);
      }
    } catch (error) {
      console.error('Error filtering ad spaces by category:', error);
      setAdSpaces([]);
      setFilteredAdSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative text-white overflow-hidden min-h-[600px] flex items-center">
        {/* GIF Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="/assets/homebanner/homebanner.gif" 
            alt="Advertising spaces background"
            className="w-full h-full object-cover"
            style={{ 
              objectFit: 'cover', 
              minHeight: '100%',
              width: '100%',
              height: '100%',
              filter: 'blur(4px)'
            }}
          />
        </div>
        {/* Color overlay matching site theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/20 via-[#F50057]/15 to-[#E91E63]/20 z-[1]"></div>
        {/* Content */}
        <div className="relative z-10 pt-24 pb-16 w-full">
          <div className="max-w-3xl pl-8 md:pl-12 lg:pl-16">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Campaign Planning</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              Find Perfect Ad Spaces for Your Campaign
          </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md">
              Discover, plan, and book advertising inventory across India
            </p>
            <div className="flex gap-4">
              <Link 
                href="/search"
                className="bg-white text-[#E91E63] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                Explore Ad Spaces
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/ai-planner"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors shadow-lg"
              >
                Try AI Planner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-app px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Ad Spaces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-sm text-gray-600">Daily Impressions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>


      <div className="container-app px-6 py-8">
        {/* Categories Grid - Always Show */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
              <p className="text-gray-600 text-lg">Discover advertising spaces tailored to your campaign needs</p>
            </div>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse flex flex-col items-center justify-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : displayCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayCategories.map((category) => {
                const isParent = !category.parent_category_id;
                const hasChildren = childrenByParent[category.id]?.length > 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center transform hover:scale-105 hover:shadow-lg ${
                      selectedCategories.includes(category.id)
                        ? 'border-[#E91E63] scale-105 bg-white' 
                        : 'bg-white border-gray-200 hover:border-[#E91E63]/50 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
                    }`}
                  >
                    {/* Animated gradient background for selected cards */}
                    {selectedCategories.includes(category.id) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63] via-[#F50057] to-[#FF6B9D] opacity-20 animate-gradient-shift rounded-xl"></div>
                    )}
                    
                    {/* Background gradient effect on hover (only for non-selected) */}
                    {!selectedCategories.includes(category.id) && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#E91E63]/5 to-transparent rounded-xl"></div>
                    )}
                    
                    {/* Icon container with better styling */}
                    <div className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      selectedCategories.includes(category.id)
                        ? 'bg-gradient-to-br from-[#E91E63] to-[#F50057] shadow-lg shadow-[#E91E63]/30' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-[#E91E63]/10 group-hover:to-[#E91E63]/5'
                    }`}>
                      {category.icon_url ? (
                        <img 
                          src={category.icon_url} 
                          alt={category.name}
                          className={`w-10 h-10 object-contain transition-transform duration-300 ${
                            selectedCategories.includes(category.id) ? 'brightness-0 invert' : 'group-hover:scale-110'
                          }`}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const emojiSpan = e.currentTarget.parentElement?.querySelector('.category-emoji');
                            if (emojiSpan) emojiSpan.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-3xl category-emoji ${category.icon_url ? 'hidden' : ''} ${
                        selectedCategories.includes(category.id) ? 'filter brightness-0 invert' : ''
                      }`}>
                        {category.emoji || '📍'}
                      </span>
                    </div>
                    
                    {/* Category name */}
                    <h3 className={`relative z-10 font-bold text-center text-sm leading-tight mb-2 px-2 min-h-[3rem] flex items-center justify-center ${
                      selectedCategories.includes(category.id)
                        ? 'text-[#E91E63]' 
                        : 'text-gray-900 group-hover:text-[#E91E63]'
                    }`}>
                      {category.name}
                    </h3>
                    
                    {/* Count badge */}
                    <div className={`relative z-10 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-[#E91E63] text-white' 
                        : 'bg-gray-100 text-gray-700 group-hover:bg-[#E91E63]/10 group-hover:text-[#E91E63]'
                    }`}>
                      {category.count} {category.count === 1 ? 'space' : 'spaces'}
                    </div>
                    
                    {/* Children indicator */}
                    {hasChildren && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-gray-600 font-bold">{childrenByParent[category.id].length}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-700 text-lg font-semibold mb-2">No categories available</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">Categories will appear here once they are added to the database.</p>
            </div>
          )}
        </section>

        {/* Recommended High Traffic Ad Spaces */}
        {(() => {
          // Use recommendedSpaces state (not affected by filters)
          const highTrafficSpaces = recommendedSpaces;
          
          if (highTrafficSpaces.length === 0) return null;
          
          const scrollCarousel = (direction: 'left' | 'right') => {
            if (carouselRef.current) {
              const scrollAmount = 400; // Scroll by 400px
              carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
              });
            }
          };

          return (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recommended High Traffic Spaces</h2>
                    <p className="text-gray-600">Premium locations with maximum visibility and footfall</p>
                  </div>
                </div>
                <Link 
                  href="/search" 
                  className="text-[#E91E63] font-medium hover:text-[#F50057] inline-flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>

                {/* Carousel Container */}
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-12"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {highTrafficSpaces.map((space) => {
                    const formatMetric = (value: number) => {
                      if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}K+`;
                      }
                      return value.toString();
                    };

                    return (
                      <Link 
                        key={space.id} 
                        href={`/ad-space/${space.id}`}
                        className="block relative group cursor-pointer flex-shrink-0"
                        style={{ width: 'calc(25% - 18px)', minWidth: '280px' }}
                      >
                        {/* Image Container - Fills entire card, matches AdSpaceCard size */}
                        <div className="relative w-full h-72 rounded-xl overflow-hidden bg-gray-200 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
                          {space.images && space.images.length > 0 ? (
                            <>
                              <img
                                src={space.images[0]}
                                alt={space.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                }}
                              />
                              <div className="image-fallback hidden w-full h-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 absolute inset-0">
                                <span className="text-gray-400 text-sm">No Image</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 absolute inset-0">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                          
                          {/* Overlay with Eye Icon and View Count - Top Left Corner */}
                          <div className="absolute top-3 left-3 flex items-center gap-2 bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none">
                            <Eye className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {formatMetric(space.daily_impressions || 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Featured Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
                Limited Time Offer
              </div>
              <h2 className="text-3xl font-bold mb-3">Get 20% Off Your First Campaign</h2>
              <p className="text-lg text-white/90 mb-6">
                Book your ad spaces now and save big on your first campaign with our platform
              </p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Claim Offer
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
        </section>

        {/* All Ad Spaces - Single List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Ad Spaces</h2>
              <p className="text-gray-600">Explore our complete inventory across India</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/search" 
                className="text-[#E91E63] font-medium hover:text-[#F50057] inline-flex items-center gap-1"
              >
                View on map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse card-shadow" />
              ))}
            </div>
          ) : filteredAdSpaces.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-500 mb-2">
                {loading 
                  ? 'Loading ad spaces...'
                  : selectedCity 
                    ? `No ad spaces found in ${selectedCity}` 
                    : adSpaces.length === 0
                      ? 'No ad spaces available. Please check your database connection.'
                      : 'No ad spaces match your filters'}
              </p>
              <p className="text-sm text-gray-400">
                {loading 
                  ? 'Please wait...'
                  : selectedCity 
                    ? 'Try selecting a different city or clearing filters' 
                    : adSpaces.length === 0
                      ? 'Make sure you have run the seed_data.sql file in Supabase'
                      : 'Try adjusting your filters or selecting a location'}
              </p>
              {!loading && adSpaces.length === 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>Debug: Check browser console for errors</p>
                  <p>Total ad spaces in state: {adSpaces.length}</p>
                  <p>Filtered ad spaces: {filteredAdSpaces.length}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {filteredAdSpaces.map((space) => (
                <AdSpaceCard key={space.id} adSpace={space} />
              ))}
            </div>
          )}
          
          {/* Location info */}
          {!loading && filteredAdSpaces.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {selectedCity 
                ? `Showing ${filteredAdSpaces.length} ad spaces in ${selectedCity}`
                : `Showing ${filteredAdSpaces.length} ad spaces (select location to filter)`}
            </div>
          )}
        </section>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={closeFilters}
        onApply={(filters) => {
          setAppliedFilters(filters);
          closeFilters();
        }}
        initialFilters={appliedFilters || undefined}
      />
    </div>
  );
}
