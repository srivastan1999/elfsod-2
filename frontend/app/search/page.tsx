'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, X, SlidersHorizontal, MapPin, Calendar, ArrowRight, Map, Grid3x3 } from 'lucide-react';
import AdSpaceCard from '@/components/common/AdSpaceCard';
import FilterPanel from '@/components/filters/FilterPanel';
import CartNotification from '@/components/common/CartNotification';
import { AdSpace } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import { useFilterStore } from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { getAdSpaces } from '@/lib/supabase/services';
import dynamic from 'next/dynamic';

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

// Dynamically import map to avoid SSR issues
const MapView = dynamic(() => import('@/components/search/MapView'), {
  ssr: false,
});

function SearchPageContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams?.get('category');
  const adSpaceIdParam = searchParams?.get('adSpaceId');
  const startDateParam = searchParams?.get('startDate');
  const endDateParam = searchParams?.get('endDate');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [selectedAdSpace, setSelectedAdSpace] = useState<AdSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: showFilters, closeFilters, toggleFilters } = useFilterStore();
  const [additionalKm, setAdditionalKm] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedItemTitle, setAddedItemTitle] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const selectedCity = useLocationStore((state) => state.selectedCity);
  const { startDate, endDate, setStartDate, setEndDate } = useCampaignDatesStore();
  const addItem = useCartStore((state) => state.addItem);

  // Update dates from URL params when component mounts or params change
  useEffect(() => {
    if (startDateParam) setStartDate(startDateParam);
    if (endDateParam) setEndDate(endDateParam);
  }, [startDateParam, endDateParam, setStartDate, setEndDate]);

  useEffect(() => {
    fetchAdSpaces();
  }, [searchQuery, categoryFilter, selectedCity, adSpaceIdParam, appliedFilters]);

  // Handle adSpaceId parameter - select the ad space and show on map
  useEffect(() => {
    if (adSpaceIdParam && adSpaces.length > 0) {
      const space = adSpaces.find(s => s.id === adSpaceIdParam);
      if (space && space.id !== selectedAdSpace?.id) {
        setSelectedAdSpace(space);
        setAdditionalKm(0); // Reset additional coverage when selecting new space
        // Update location store to match the ad space city
        if (space.location?.city) {
          useLocationStore.getState().setSelectedCity(space.location.city);
        }
      }
    }
  }, [adSpaceIdParam, adSpaces]);

  // Reset additional km when selected ad space changes
  useEffect(() => {
    setAdditionalKm(0);
  }, [selectedAdSpace?.id]);

  const fetchAdSpaces = async () => {
    try {
      const filters: any = {
        availabilityStatus: 'available',
      };

      // Apply filters
      if (selectedCity) {
        filters.city = selectedCity;
      }

      if (categoryFilter) {
        filters.categoryId = categoryFilter;
      }

      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      // Apply additional filters from appliedFilters
      if (appliedFilters) {
        if (appliedFilters.priceRange.min !== 0 || appliedFilters.priceRange.max !== 100000) {
          filters.minPrice = appliedFilters.priceRange.min;
          filters.maxPrice = appliedFilters.priceRange.max;
        }

        if (appliedFilters.footfallRange.min !== 0 || appliedFilters.footfallRange.max !== 1000000) {
          filters.minFootfall = appliedFilters.footfallRange.min;
          filters.maxFootfall = appliedFilters.footfallRange.max;
        }

        if (appliedFilters.displayType) {
          filters.displayType = appliedFilters.displayType;
        }

        if (appliedFilters.publishers && appliedFilters.publishers.length > 0) {
          filters.publisherId = appliedFilters.publishers; // Pass array to service
        }

        // Handle locationCategories filtering using the filter API
        // This implements: Filter by parent category (gets all child categories)
        if (appliedFilters.locationCategories && appliedFilters.locationCategories.length > 0) {
          // Use the filter API with categoryIds parameter
          filters.categoryIds = appliedFilters.locationCategories.join(',');
        }
      }

      // Fetch from database - use filter API if category filtering is needed
      let resultData: AdSpace[] = [];
      
      // Use filter API if locationCategories are selected, otherwise use regular API
      const useFilterAPI = appliedFilters?.locationCategories && appliedFilters.locationCategories.length > 0;
      const apiEndpoint = useFilterAPI ? '/api/ad-spaces/filter' : '/api/ad-spaces';
      
      try {
        const params = new URLSearchParams();
        if (filters.city) params.append('city', filters.city);
        if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
        if (filters.availabilityStatus) params.append('availabilityStatus', filters.availabilityStatus);
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.minFootfall !== undefined) params.append('minFootfall', filters.minFootfall.toString());
        if (filters.maxFootfall !== undefined) params.append('maxFootfall', filters.maxFootfall.toString());
        if (filters.displayType) params.append('displayType', filters.displayType);
        if (filters.publisherId) {
          const pubIds = Array.isArray(filters.publisherId) ? filters.publisherId : [filters.publisherId];
          params.append('publisherId', pubIds.join(','));
        }
        
        // Category filtering
        if (useFilterAPI && filters.categoryIds) {
          params.append('categoryIds', filters.categoryIds);
        } else if (filters.categoryId) {
          params.append('categoryId', filters.categoryId);
        }
        
        params.append('limit', '100');

        const response = await fetch(`${apiEndpoint}?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            resultData = result.data;
            console.log('✅ Fetched', resultData.length, 'ad spaces via', useFilterAPI ? 'filter API' : 'API route');
          } else {
            throw new Error('API route returned unsuccessful response');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API route returned ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
      } catch (apiError) {
        console.warn('⚠️ API route failed, trying direct service:', apiError);
        try {
          // Fallback to direct Supabase service call
          resultData = await getAdSpaces(filters);
          console.log('✅ Fetched', resultData.length, 'ad spaces via direct service');
        } catch (directError) {
          console.error('❌ Both API route and direct service failed:', directError);
          throw directError;
        }
      }

      // Apply client-side sorting if needed
      if (appliedFilters && appliedFilters.sortBy !== 'none') {
        resultData = [...resultData].sort((a, b) => {
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

      // If adSpaceId is provided, show that specific space and nearby ones
      if (adSpaceIdParam) {
        const targetSpace = resultData.find((s: any) => s.id === adSpaceIdParam);
        if (targetSpace) {
          // Show the target space and others in the same city
          resultData = resultData.filter((space: any) => 
            space.id === adSpaceIdParam || 
            space.location?.city === targetSpace.location?.city
          );
        }
      }

      setAdSpaces(resultData);
    } catch (error) {
      console.error('Error fetching ad spaces:', error);
      setAdSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedAdSpace || !startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    try {
      addItem(selectedAdSpace, startDate, endDate);
      setAddedItemTitle(selectedAdSpace.title);
      setShowCartNotification(true);
      setSelectedAdSpace(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Left Panel - Google Maps Style */}
      <div className="maps-panel">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 rounded-full p-1"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              title={viewMode === 'map' ? 'Switch to Grid View' : 'Switch to Map View'}
            >
              {viewMode === 'map' ? (
                <>
                  <Grid3x3 className="w-4 h-4" />
                  Grid
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  Map
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{adSpaces.length}</span> ad spaces found
            {categoryFilter && (
              <span className="ml-2 text-xs bg-[#E91E63] text-white px-2 py-1 rounded-full">
                {categoryFilter.replace('-', ' ')}
              </span>
            )}
          </p>
        </div>

        {/* Suggested Filters */}
        {!categoryFilter && !searchQuery && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-2">Suggested searches</p>
            <div className="flex flex-wrap gap-2">
              {['Billboard', 'Digital Screens', 'Airport', 'Metro Station'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-[#E91E63] hover:text-white text-xs rounded-full text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto h-[calc(100vh-240px)]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg h-32 animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : adSpaces.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No results found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {adSpaces.map((space) => (
                <div 
                  key={space.id} 
                  onClick={() => {
                    setSelectedAdSpace(space);
                  }}
                  className={`cursor-pointer rounded-lg transition-all ${
                    selectedAdSpace?.id === space.id 
                      ? 'ring-2 ring-[#E91E63]' 
                      : ''
                  }`}
                >
                  <AdSpaceCard adSpace={space} variant="compact" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <>
            <MapView 
              adSpaces={adSpaces} 
              onMarkerClick={(space) => {
                setSelectedAdSpace(space);
                setAdditionalKm(0);
              }}
              selectedId={selectedAdSpace?.id}
              selectedAdSpace={selectedAdSpace ? {
                ...selectedAdSpace,
                route: selectedAdSpace.route ? {
                  ...selectedAdSpace.route,
                  coverage_radius: selectedAdSpace.route.base_coverage_km + additionalKm
                } : undefined
              } : null}
            />
            
            {/* Slide-in Panel for Selected Ad Space */}
            {selectedAdSpace && (
              <>
                <div 
                  className="absolute inset-0 bg-black/20 z-20"
                  onClick={() => setSelectedAdSpace(null)}
                />
                <div className="absolute right-0 top-0 bottom-0 w-[450px] bg-white shadow-2xl z-30 overflow-y-auto animate-slide-in">
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedAdSpace(null)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 z-10"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Image */}
                  <div className="w-full h-64 bg-gray-200">
                    {selectedAdSpace.images?.[0] ? (
                      <img
                        src={selectedAdSpace.images[0]}
                        alt={selectedAdSpace.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Title and Location */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedAdSpace.title}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-[#E91E63]" />
                        <span>{selectedAdSpace.location?.address}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(selectedAdSpace.price_per_day)}
                        </span>
                        <span className="text-gray-600">/day</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPrice(selectedAdSpace.price_per_day * 30)} per month
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedAdSpace.description}
                      </p>
                    </div>

                    {/* Coverage Information for Movable Ad Spaces */}
                    {selectedAdSpace.route && (
                      <div className="bg-gradient-to-r from-[#E91E63]/5 to-[#F50057]/5 rounded-xl p-4 border border-[#E91E63]/20">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#E91E63]" />
                          Coverage Area
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Center Location</p>
                            <p className="text-sm font-medium text-gray-900">{selectedAdSpace.route.center_location.address}</p>
                          </div>
                          
                          <div className="pt-3 border-t border-[#E91E63]/20">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-gray-600">Base Coverage</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedAdSpace.route.base_coverage_km} km</p>
                            </div>
                            
                            {/* Additional Coverage Slider */}
                            {selectedAdSpace.route.additional_coverage_km && selectedAdSpace.route.additional_coverage_km > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs text-gray-600">Add More Coverage</p>
                                  <div className="flex items-center gap-2">
                                    {additionalKm > 0 && (() => {
                                      const baseRadius = selectedAdSpace.route.base_coverage_km;
                                      const totalRadius = baseRadius + additionalKm;
                                      const areaMultiplier = (totalRadius * totalRadius) / (baseRadius * baseRadius);
                                      const reachIncrease = ((areaMultiplier - 1) * 100).toFixed(0);
                                      return (
                                        <span className="text-[10px] text-[#4CAF50] font-medium animate-pulse">
                                          +{reachIncrease}% reach
                                        </span>
                                      );
                                    })()}
                                    <p className="text-sm font-semibold text-[#E91E63]">
                                      +{additionalKm} km
                                    </p>
                                  </div>
                                </div>
                                <div className="relative">
                                  <input
                                    type="range"
                                    min="0"
                                    max={selectedAdSpace.route.additional_coverage_km}
                                    step="1"
                                    value={additionalKm}
                                    onChange={(e) => setAdditionalKm(Number(e.target.value))}
                                    className="w-full accent-[#E91E63] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, #E91E63 0%, #E91E63 ${(additionalKm / selectedAdSpace.route.additional_coverage_km) * 100}%, #e5e7eb ${(additionalKm / selectedAdSpace.route.additional_coverage_km) * 100}%, #e5e7eb 100%)`
                                    }}
                                  />
                                  {/* Value indicator on slider */}
                                  {additionalKm > 0 && (
                                    <div
                                      className="absolute top-0 transform -translate-x-1/2 -translate-y-6"
                                      style={{
                                        left: `${(additionalKm / selectedAdSpace.route.additional_coverage_km) * 100}%`
                                      }}
                                    >
                                      <div className="bg-[#E91E63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {additionalKm}km
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] text-gray-500">0 km</span>
                                  <span className="text-[10px] text-gray-500">{selectedAdSpace.route.additional_coverage_km} km max</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Total Coverage Display */}
                            <div className={`mt-4 pt-3 border-t border-[#E91E63]/20 rounded-lg p-3 transition-all duration-300 ${
                              additionalKm > 0 ? 'bg-gradient-to-r from-[#E91E63]/10 to-[#F50057]/10 border-[#E91E63]/30' : 'bg-white/50'
                            }`}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">Total Coverage</p>
                                <p className={`text-xl font-bold transition-all duration-300 ${
                              additionalKm > 0 ? 'text-[#E91E63] scale-110' : 'text-[#E91E63]'
                            }`}>
                                  {selectedAdSpace.route.base_coverage_km + additionalKm} km
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Radius shown on map
                              </p>
                              {additionalKm > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-[#4CAF50]">
                                  <span className="font-medium">✓</span>
                                  <span>Coverage area: {((Math.PI * Math.pow(selectedAdSpace.route.base_coverage_km + additionalKm, 2)) / Math.PI / Math.pow(selectedAdSpace.route.base_coverage_km, 2) - 1).toFixed(1)}x larger</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audience Metrics */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Audience & Reach</h3>
                      {selectedAdSpace.route ? (
                        <div className="space-y-3">
                          {/* Calculate dynamic metrics based on coverage and date range */}
                          {(() => {
                            const baseRadius = selectedAdSpace.route.base_coverage_km;
                            const totalRadius = baseRadius + additionalKm;
                            // Coverage area increases with radius squared (πr²)
                            const baseArea = Math.PI * baseRadius * baseRadius;
                            const totalArea = Math.PI * totalRadius * totalRadius;
                            const coverageMultiplier = totalArea / baseArea;
                            
                            // Calculate days for date-based impressions
                            const days = startDate && endDate 
                              ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                              : 1;
                            
                            const baseDailyImpressions = selectedAdSpace.daily_impressions || 0;
                            const baseMonthlyFootfall = selectedAdSpace.monthly_footfall || 0;
                            const baseDailyFootfall = Math.round(baseMonthlyFootfall / 30); // Convert monthly to daily
                            
                            // Scale by coverage area multiplier
                            const dynamicDailyImpressions = Math.round(baseDailyImpressions * coverageMultiplier);
                            const dynamicDailyFootfall = Math.round(baseDailyFootfall * coverageMultiplier);
                            
                            // Total impressions and footfall for the campaign duration
                            const totalImpressions = dynamicDailyImpressions * days;
                            const totalFootfall = dynamicDailyFootfall * days;
                            
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className={`bg-blue-50 rounded-lg p-3 border transition-all duration-300 ${
                                    (additionalKm > 0 || days > 1) ? 'border-blue-300 shadow-md scale-[1.02]' : 'border-blue-100'
                                  } relative`}>
                                    {(additionalKm > 0 || days > 1) && (
                                      <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                        {days > 1 ? `×${days}` : `+${((coverageMultiplier - 1) * 100).toFixed(0)}%`}
                                      </div>
                                    )}
                                    <div className={`text-lg font-bold transition-all duration-300 ${
                                      (additionalKm > 0 || days > 1) ? 'text-blue-700 scale-105' : 'text-gray-900'
                                    }`}>
                                      {days > 1 
                                        ? `${(totalImpressions / 1000).toFixed(0)}K+`
                                        : `${(dynamicDailyImpressions / 1000).toFixed(0)}K+`
                                      }
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {days > 1 ? 'Total Impressions' : 'Daily Impressions'}
                                    </div>
                                    {(additionalKm > 0 || days > 1) && (
                                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                        <span>Base:</span>
                                        <span className="line-through">
                                          {days > 1 
                                            ? `${(baseDailyImpressions * days / 1000).toFixed(0)}K`
                                            : `${(baseDailyImpressions / 1000).toFixed(0)}K`
                                          }
                                        </span>
                                        <span className="text-[#4CAF50] font-medium">
                                          → {days > 1 
                                            ? `${(totalImpressions / 1000).toFixed(0)}K`
                                            : `${(dynamicDailyImpressions / 1000).toFixed(0)}K`
                                          }
                                        </span>
                                      </div>
                                    )}
                                    {days > 1 && (
                                      <div className="text-[10px] text-[#E91E63] font-medium mt-1">
                                        {days} days × {(dynamicDailyImpressions / 1000).toFixed(0)}K/day
                                      </div>
                                    )}
                                  </div>
                                  <div className={`bg-purple-50 rounded-lg p-3 border transition-all duration-300 ${
                                    (additionalKm > 0 || days > 1) ? 'border-purple-300 shadow-md scale-[1.02]' : 'border-purple-100'
                                  } relative`}>
                                    {(additionalKm > 0 || days > 1) && (
                                      <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                        {days > 1 ? `×${days}` : `+${((coverageMultiplier - 1) * 100).toFixed(0)}%`}
                                      </div>
                                    )}
                                    <div className={`text-lg font-bold transition-all duration-300 ${
                                      (additionalKm > 0 || days > 1) ? 'text-purple-700 scale-105' : 'text-gray-900'
                                    }`}>
                                      {days > 1 
                                        ? `${(totalFootfall / 1000).toFixed(0)}K+`
                                        : `${(dynamicDailyFootfall / 1000).toFixed(0)}K+`
                                      }
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {days > 1 ? 'Total Footfall' : 'Daily Footfall'}
                                    </div>
                                    {(additionalKm > 0 || days > 1) && (
                                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                        <span>Base:</span>
                                        <span className="line-through">
                                          {days > 1 
                                            ? `${(baseDailyFootfall * days / 1000).toFixed(0)}K`
                                            : `${(baseDailyFootfall / 1000).toFixed(0)}K`
                                          }
                                        </span>
                                        <span className="text-[#4CAF50] font-medium">
                                          → {days > 1 
                                            ? `${(totalFootfall / 1000).toFixed(0)}K`
                                            : `${(dynamicDailyFootfall / 1000).toFixed(0)}K`
                                          }
                                        </span>
                                      </div>
                                    )}
                                    {days > 1 && (
                                      <div className="text-[10px] text-[#E91E63] font-medium mt-1">
                                        {days} days × {(dynamicDailyFootfall / 1000).toFixed(0)}K/day
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Coverage Impact Info */}
                                {additionalKm > 0 && (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse" />
                                      <p className="text-xs font-semibold text-green-800">
                                        Coverage Increased by {additionalKm} km
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-green-700">
                                      Your reach has increased by {((coverageMultiplier - 1) * 100).toFixed(1)}% due to expanded coverage area
                                    </p>
                                  </div>
                                )}
                                
                                {/* Date Impact Info */}
                                {days > 1 && (
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-3 h-3 text-[#E91E63]" />
                                      <p className="text-xs font-semibold text-blue-800">
                                        Campaign Duration: {days} days
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-blue-700">
                                      Total impressions will be {days}x the daily impressions for your campaign period
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {(() => {
                            const days = startDate && endDate 
                              ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                              : 1;
                            const baseDailyImpressions = selectedAdSpace.daily_impressions || 0;
                            const baseMonthlyFootfall = selectedAdSpace.monthly_footfall || 0;
                            const baseDailyFootfall = Math.round(baseMonthlyFootfall / 30); // Convert monthly to daily
                            
                            const totalImpressions = baseDailyImpressions * days;
                            const totalFootfall = baseDailyFootfall * days;
                            
                            return (
                              <>
                                <div className={`bg-blue-50 rounded-lg p-3 border transition-all duration-300 ${
                                  days > 1 ? 'border-blue-300 shadow-md scale-[1.02]' : 'border-blue-100'
                                } relative`}>
                                  {days > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                      ×{days}
                                    </div>
                                  )}
                                  <div className={`text-lg font-bold transition-all duration-300 ${
                                    days > 1 ? 'text-blue-700 scale-105' : 'text-gray-900'
                                  }`}>
                                    {days > 1 
                                      ? `${(totalImpressions / 1000).toFixed(0)}K+`
                                      : `${(baseDailyImpressions / 1000).toFixed(0)}K+`
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {days > 1 ? 'Total Impressions' : 'Daily Impressions'}
                                  </div>
                                  {days > 1 && (
                                    <div className="text-[10px] text-[#E91E63] font-medium mt-1">
                                      {days} days × {(baseDailyImpressions / 1000).toFixed(0)}K/day
                                    </div>
                                  )}
                                </div>
                                <div className={`bg-purple-50 rounded-lg p-3 border transition-all duration-300 ${
                                  days > 1 ? 'border-purple-300 shadow-md scale-[1.02]' : 'border-purple-100'
                                } relative`}>
                                  {days > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                      ×{days}
                                    </div>
                                  )}
                                  <div className={`text-lg font-bold transition-all duration-300 ${
                                    days > 1 ? 'text-purple-700 scale-105' : 'text-gray-900'
                                  }`}>
                                    {days > 1 
                                      ? `${(totalFootfall / 1000).toFixed(0)}K+`
                                      : `${(baseDailyFootfall / 1000).toFixed(0)}K+`
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {days > 1 ? 'Total Footfall' : 'Daily Footfall'}
                                  </div>
                                  {days > 1 && (
                                    <div className="text-[10px] text-[#E91E63] font-medium mt-1">
                                      {days} days × {(baseDailyFootfall / 1000).toFixed(0)}K/day
                                    </div>
                                  )}
                                </div>
                                {days > 1 && (
                                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-3 h-3 text-[#E91E63]" />
                                      <p className="text-xs font-semibold text-blue-800">
                                        Campaign Duration: {days} days
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-blue-700">
                                      Total impressions will be {days}x the daily impressions for your campaign period
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Date Selection */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        <Calendar className="w-4 h-4 inline mr-2 text-[#E91E63]" />
                        Select Dates
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Cost */}
                    {startDate && endDate && (
                      <div className="bg-[#E91E63]/5 rounded-xl p-4 border border-[#E91E63]/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="font-medium text-gray-900">
                            {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        {selectedAdSpace.route && additionalKm > 0 && (
                          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E91E63]/20">
                            <span className="text-sm text-gray-600">Base Price</span>
                            <span className="font-medium text-gray-700">
                              {formatPrice(
                                selectedAdSpace.price_per_day *
                                Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                              )}
                            </span>
                          </div>
                        )}
                        {selectedAdSpace.route && additionalKm > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Additional Coverage</span>
                            <span className="font-medium text-[#E91E63]">
                              +{formatPrice(
                                (selectedAdSpace.price_per_day * 0.15 * additionalKm) *
                                Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-[#E91E63]/20">
                          <span className="text-sm font-medium text-gray-700">Total Cost</span>
                          <span className="text-xl font-bold text-[#E91E63]">
                            {formatPrice(
                              (selectedAdSpace.price_per_day + (selectedAdSpace.route && additionalKm > 0 ? selectedAdSpace.price_per_day * 0.15 * additionalKm : 0)) *
                              Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                            )}
                          </span>
                        </div>
                        {selectedAdSpace.route && additionalKm > 0 && (
                          <p className="text-[10px] text-gray-500 mt-2">
                            * Additional coverage charged at 15% per km
                          </p>
                        )}
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!startDate || !endDate}
                      className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                        startDate && endDate
                          ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg active:scale-[0.98]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add to Cart
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <div className="container-app">
              <div className="grid grid-cols-3 gap-6">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl h-80 animate-pulse card-shadow" />
                    ))}
                  </>
                ) : (
                  adSpaces.map((space) => (
                    <div
                      key={space.id}
                      onClick={() => {
                        setSelectedAdSpace(space);
                      }}
                      className="cursor-pointer"
                    >
                      <AdSpaceCard adSpace={space} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
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

      {/* Cart Notification */}
      <CartNotification
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
        adSpaceTitle={addedItemTitle}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
