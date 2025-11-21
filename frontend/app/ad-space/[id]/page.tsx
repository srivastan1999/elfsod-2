'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, CheckCircle, Eye, Users, Target, ArrowLeft, Calendar, Share2, Heart, Building, Clock } from 'lucide-react';
import { AdSpace } from '@/types';
import { getAdSpaceById } from '@/lib/supabase/services';
import { useCartStore } from '@/store/useCartStore';
import CartNotification from '@/components/common/CartNotification';
import TrafficInsights from '@/components/common/TrafficInsights';
import dynamic from 'next/dynamic';

// Preload map components for faster loading
const mapComponentsPromise = import('react-leaflet');

const MapContainer = dynamic(
  () => mapComponentsPromise.then((mod) => mod.MapContainer),
  { ssr: false, loading: () => null }
);
const TileLayer = dynamic(
  () => mapComponentsPromise.then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => mapComponentsPromise.then((mod) => mod.Marker),
  { ssr: false }
);
const Circle = dynamic(
  () => mapComponentsPromise.then((mod) => mod.Circle),
  { ssr: false }
);
const Popup = dynamic(
  () => mapComponentsPromise.then((mod) => mod.Popup),
  { ssr: false }
);

// Import Leaflet for icon creation
import * as L from 'leaflet';

// Traffic Circle Component - Always renders
function TrafficCircle({ adSpace }: { adSpace: AdSpace }) {
  const trafficLevel = adSpace.traffic_data?.traffic_level;
  const nearbyPlaces = adSpace.traffic_data?.nearby_places_count;
  
  // Determine traffic level: use actual level, or estimate from nearby places, or default to moderate
  let displayLevel = trafficLevel;
  if (!displayLevel || displayLevel === 'unknown') {
    // Estimate from nearby places count
    if (nearbyPlaces !== undefined) {
      if (nearbyPlaces > 20) displayLevel = 'high';
      else if (nearbyPlaces > 10) displayLevel = 'moderate';
      else if (nearbyPlaces > 5) displayLevel = 'moderate';
      else displayLevel = 'low';
    } else {
      displayLevel = 'moderate'; // Default - always show something
    }
  }
  
  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'very_high': return { color: '#10B981', fillColor: '#10B981' };
      case 'high': return { color: '#3B82F6', fillColor: '#3B82F6' };
      case 'moderate': return { color: '#F59E0B', fillColor: '#F59E0B' };
      case 'low': return { color: '#6B7280', fillColor: '#6B7280' };
      default: return { color: '#9CA3AF', fillColor: '#9CA3AF' };
    }
  };
  
  const colors = getTrafficColor(displayLevel);
  const isEstimated = !trafficLevel || trafficLevel === 'unknown';
  
  // Fixed 1km radius
  const trafficRadius = 1000; // Fixed 1km radius
  
  // Get traffic size/amount for display
  const getTrafficSize = () => {
    if (adSpace.traffic_data?.average_daily_visitors) {
      const visitors = adSpace.traffic_data.average_daily_visitors;
      if (visitors >= 1000) return `${(visitors / 1000).toFixed(1)}K`;
      return visitors.toString();
    }
    if (adSpace.daily_impressions && adSpace.daily_impressions > 0) {
      const impressions = adSpace.daily_impressions;
      if (impressions >= 1000) return `${(impressions / 1000).toFixed(1)}K`;
      return impressions.toString();
    }
    if (nearbyPlaces !== undefined) {
      return `${nearbyPlaces}`;
    }
    return null;
  };
  
  const trafficSize = getTrafficSize();
  
  // Create text label icon for traffic size
  const createTrafficLabelIcon = (text: string | null) => {
    if (!text) return null;
    
    const bgColor = displayLevel === 'very_high' ? '#10B981' :
                    displayLevel === 'high' ? '#3B82F6' :
                    displayLevel === 'moderate' ? '#F59E0B' : '#6B7280';
    
    const iconSize = 60;
    
    const svgIcon = `
      <div style="
        background: ${bgColor};
        color: white;
        border-radius: 50%;
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        text-align: center;
        line-height: 1;
      ">
        ${text}
      </div>
    `;
    
    if (typeof window !== 'undefined') {
      return L.divIcon({
        html: svgIcon,
        className: 'traffic-label-marker',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });
    }
    return null;
  };
  
  const labelIcon = createTrafficLabelIcon(trafficSize);
  
  // Always render the circle
  return (
    <>
      <Circle
        key={`traffic-${adSpace.id}`}
        center={[adSpace.latitude, adSpace.longitude]}
        radius={trafficRadius} // Fixed 1km radius
        pathOptions={{
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: 0.25, // Increased opacity for better visibility
          weight: 4, // Increased weight for better visibility
          dashArray: isEstimated ? '8, 4' : undefined, // Dashed if estimated
        }}
      >
      <Popup>
        <div className="p-2">
          <p className="font-semibold text-sm">Traffic Level {isEstimated && '(Estimated)'}</p>
          <p className="text-xs text-gray-600 capitalize">{displayLevel} Traffic</p>
          {adSpace.traffic_data?.average_daily_visitors ? (
            <p className="text-xs text-gray-500 mt-1">
              ~{adSpace.traffic_data.average_daily_visitors.toLocaleString()} daily visitors
            </p>
          ) : nearbyPlaces !== undefined ? (
            <p className="text-xs text-gray-500 mt-1">
              {nearbyPlaces} nearby places
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Default traffic zone
            </p>
          )}
          {isEstimated && (
            <p className="text-xs text-yellow-600 mt-1 italic">
              Click refresh to load actual traffic data
            </p>
          )}
        </div>
      </Popup>
    </Circle>
    
    {/* Traffic size label marker at center */}
    {labelIcon && (
      <Marker
        key={`traffic-label-${adSpace.id}`}
        position={[adSpace.latitude, adSpace.longitude]}
        icon={labelIcon}
        zIndexOffset={1000} // Ensure it's above the circle
      >
        <Popup>
          <div className="p-2">
            <p className="font-semibold text-sm">{adSpace.title}</p>
            <p className="text-xs text-gray-600 capitalize">{displayLevel} Traffic</p>
            {trafficSize && (
              <p className="text-xs text-gray-500 mt-1">
                Traffic: {trafficSize}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    )}
    </>
  );
}

export default function AdSpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [mapInView, setMapInView] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
    if (params.id) {
      fetchAdSpace(params.id as string);
    }
  }, [params.id]);

  // Preload map libraries when component mounts
  useEffect(() => {
    if (mounted) {
      // Preload map libraries in the background
      mapComponentsPromise.catch(() => {});
    }
  }, [mounted]);

  // Load map when adSpace is ready (simplified - always load when data is available)
  useEffect(() => {
    if (mounted && adSpace) {
      // Small delay to allow page to render first, then load map
      const timer = setTimeout(() => {
        setMapInView(true);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [mounted, adSpace]);

  const fetchAdSpace = async (id: string) => {
    try {
      const space = await getAdSpaceById(id);
      if (space) {
        setAdSpace(space);
        // Fetch traffic data if not already present
        if (!space.traffic_data && space.latitude && space.longitude) {
          fetchTrafficData(space.latitude, space.longitude);
        }
      }
    } catch (error) {
      console.error('Error fetching ad space:', error);
      setAdSpace(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficData = async (lat: number, lng: number) => {
    if (!adSpace?.id) return;
    
    setTrafficLoading(true);
    try {
      // Step 1: Fetch traffic data from Google Places
      const response = await fetch(`/api/places/traffic?lat=${lat}&lng=${lng}`);
      const trafficData = await response.json();
      
      if (response.ok && trafficData.traffic_level !== 'unknown') {
        // Step 2: Save traffic data to database
        try {
          const saveResponse = await fetch(`/api/ad-spaces/${adSpace.id}/traffic`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ traffic_data: trafficData }),
          });

          if (saveResponse.ok) {
            console.log('✅ Traffic data saved to database');
          } else {
            console.warn('⚠️ Traffic data fetched but not saved:', await saveResponse.json());
          }
        } catch (saveError) {
          console.warn('⚠️ Could not save traffic data to database:', saveError);
          // Continue anyway - at least show the data
        }

        // Step 3: Update local state
        setAdSpace({
          ...adSpace,
          traffic_data: trafficData
        });
        console.log('✅ Traffic data loaded:', trafficData);
      } else {
        console.error('❌ Traffic API error:', trafficData);
        // Still update with error data so user knows what happened
        setAdSpace({
          ...adSpace,
          traffic_data: {
            ...trafficData,
            traffic_level: 'unknown',
            note: trafficData.error || 'Failed to fetch traffic data'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching traffic data:', error);
      // Set error state
      if (adSpace) {
        setAdSpace({
          ...adSpace,
          traffic_data: {
            traffic_level: 'unknown',
            note: 'Network error. Please try again.',
            last_updated: new Date().toISOString()
          }
        });
      }
    } finally {
      setTrafficLoading(false);
    }
  };

  const handleRefreshTraffic = async () => {
    if (adSpace?.latitude && adSpace?.longitude) {
      await fetchTrafficData(adSpace.latitude, adSpace.longitude);
    }
  };

  const handleAddToCart = () => {
    if (!adSpace || !startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    try {
      addItem(adSpace, startDate, endDate);
      setShowCartNotification(true);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E91E63] border-t-transparent" />
      </div>
    );
  }

  if (!adSpace) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ad space not found</p>
          <button onClick={() => router.back()} className="text-[#E91E63] font-medium">
                Go back
              </button>
            </div>
          </div>
        );
      }

  return (
    <div className="bg-white min-h-screen">
      {/* Header - Not sticky, scrolls with content */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to results
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="col-span-2 space-y-4">
            {/* Main Image */}
            <div className="w-full h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
              {adSpace.images && adSpace.images.length > 0 ? (
                <img
                  src={adSpace.images[0]}
                  alt={adSpace.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Info Sections */}
            <div className="space-y-6">
              {/* Title and Location */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{adSpace.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-[#E91E63]" />
                      <span className="text-lg">{adSpace.location?.address}</span>
                    </div>
                  </div>
                  {adSpace.category && (
                    <span className="bg-[#E91E63] text-white px-4 py-2 rounded-full text-sm font-medium">
                      {adSpace.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{adSpace.description}</p>
              </div>

              {/* Audience & Reach */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Audience & Reach</h2>
                
                {/* Traffic Data from Google Maps */}
                {adSpace.traffic_data && adSpace.traffic_data.traffic_level !== 'unknown' && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Traffic Level */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Traffic Level</span>
                        <div className={`w-2 h-2 rounded-full ${
                          adSpace.traffic_data.traffic_level === 'very_high' ? 'bg-green-500' :
                          adSpace.traffic_data.traffic_level === 'high' ? 'bg-blue-500' :
                          adSpace.traffic_data.traffic_level === 'moderate' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="text-2xl font-bold text-green-900 capitalize">
                        {adSpace.traffic_data.traffic_level === 'very_high' ? 'Very High' :
                         adSpace.traffic_data.traffic_level === 'high' ? 'High' :
                         adSpace.traffic_data.traffic_level === 'moderate' ? 'Moderate' : 'Low'}
                      </div>
                      <div className="text-xs text-green-700 mt-1">From Google Maps</div>
                    </div>

                    {/* Average Daily Visitors */}
                    {adSpace.traffic_data.average_daily_visitors && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Daily Visitors</span>
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {adSpace.traffic_data.average_daily_visitors.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-700 mt-1">Estimated from Google Places</div>
                      </div>
                    )}

                    {/* Nearby Places */}
                    {adSpace.traffic_data.nearby_places_count !== undefined && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Nearby Places</span>
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {adSpace.traffic_data.nearby_places_count}
                        </div>
                        <div className="text-xs text-purple-700 mt-1">Within 500m radius</div>
                      </div>
                    )}
                  </div>
                )}
                {(() => {
                  const days = startDate && endDate 
                    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 1;
                  
                  // Get base values from ad space
                  const baseDailyImpressions = adSpace.daily_impressions || 0;
                  const baseMonthlyFootfall = adSpace.monthly_footfall || 0;
                  const baseDailyFootfall = Math.round(baseMonthlyFootfall / 30); // Convert monthly to daily
                  
                  // For movable ads with coverage area, scale by area (radius²)
                  let dailyImpressions = baseDailyImpressions;
                  let dailyFootfall = baseDailyFootfall;
                  
                  if (adSpace.route) {
                    const coverageRadius = adSpace.route.coverage_radius || adSpace.route.base_coverage_km || 5;
                    const baseCoverage = adSpace.route.base_coverage_km || 5;
                    
                    // Coverage area scales with radius squared (πr²)
                    // If radius doubles, area quadruples
                    const areaMultiplier = Math.pow(coverageRadius / baseCoverage, 2);
                    
                    // Scale impressions and footfall by area multiplier
                    dailyImpressions = Math.round(baseDailyImpressions * areaMultiplier);
                    dailyFootfall = Math.round(baseDailyFootfall * areaMultiplier);
                  }
                  
                  // Calculate totals based on campaign duration
                  const totalImpressions = dailyImpressions * days;
                  const totalFootfall = dailyFootfall * days;
                  
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`bg-blue-50 rounded-xl p-4 border transition-all duration-300 ${
                        days > 1 ? 'border-blue-300 shadow-md scale-[1.02]' : 'border-blue-100'
                      } relative`}>
                        {days > 1 && (
                          <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                            ×{days}
                          </div>
                        )}
                        <Eye className="w-8 h-8 text-blue-600 mb-3" />
                        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          days > 1 ? 'text-blue-700 scale-105' : 'text-gray-900'
                        }`}>
                          {(() => {
                            const value = days > 1 ? totalImpressions : dailyImpressions;
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K+`;
                            } else if (value > 0) {
                              return `${value.toFixed(0)}+`;
                            } else {
                              return 'N/A';
                            }
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {days > 1 ? 'Total Impressions' : 'Daily Impressions'}
                        </div>
                        {adSpace.route && (
                          <div className="text-xs text-gray-600 mt-1">
                            Base: {(baseDailyImpressions / 1000).toFixed(0)}K → {(dailyImpressions / 1000).toFixed(0)}K
                          </div>
                        )}
                        {days > 1 && (
                          <div className="text-xs text-[#E91E63] font-medium mt-2">
                            {days} days × {dailyImpressions >= 1000 
                              ? `${(dailyImpressions / 1000).toFixed(0)}K` 
                              : dailyImpressions}/day
                          </div>
                        )}
                      </div>
                      <div className={`bg-purple-50 rounded-xl p-4 border transition-all duration-300 ${
                        days > 1 ? 'border-purple-300 shadow-md scale-[1.02]' : 'border-purple-100'
                      } relative`}>
                        {days > 1 && (
                          <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                            ×{days}
                          </div>
                        )}
                        <Users className="w-8 h-8 text-purple-600 mb-3" />
                        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          days > 1 ? 'text-purple-700 scale-105' : 'text-gray-900'
                        }`}>
                          {(() => {
                            const value = days > 1 ? totalFootfall : dailyFootfall;
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K+`;
                            } else if (value > 0) {
                              return `${value.toFixed(0)}+`;
                            } else {
                              return '0K+';
                            }
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {days > 1 ? 'Total Footfall' : 'Daily Footfall'}
                        </div>
                        {adSpace.route && (
                          <div className="text-xs text-gray-600 mt-1">
                            Base: {(baseDailyFootfall / 1000).toFixed(0)}K → {(dailyFootfall / 1000).toFixed(0)}K
                          </div>
                        )}
                        {days > 1 && (
                          <div className="text-xs text-[#E91E63] font-medium mt-2">
                            {days} days × {dailyFootfall >= 1000 
                              ? `${(dailyFootfall / 1000).toFixed(0)}K` 
                              : dailyFootfall}/day
                          </div>
                        )}
                      </div>
                      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                        <Target className="w-8 h-8 text-pink-600 mb-3" />
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {adSpace.target_audience}
                        </div>
                        <div className="text-sm text-gray-600">Target Audience</div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Peak Hours Chart from Traffic Data */}
                {adSpace.traffic_data && adSpace.traffic_data.peak_hours && adSpace.traffic_data.peak_hours.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Peak Traffic Hours</span>
                      <span className="text-xs text-gray-500">(from Google Maps)</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const peakHour = adSpace.traffic_data?.peak_hours?.find(ph => ph.hour === hour);
                        const level = peakHour?.traffic_level || 'low';
                        const height = level === 'very_high' ? 'h-8' : level === 'high' ? 'h-6' : level === 'moderate' ? 'h-4' : 'h-2';
                        const color = level === 'very_high' ? 'bg-green-500' : level === 'high' ? 'bg-blue-500' : level === 'moderate' ? 'bg-yellow-500' : 'bg-gray-300';
                        
                        return (
                          <div key={hour} className="flex flex-col items-center">
                            <div className={`w-full ${height} ${color} rounded-t transition-all hover:opacity-80 cursor-help`} title={`${hour}:00 - ${level}`}></div>
                            {hour % 3 === 0 && (
                              <span className="text-[10px] text-gray-500 mt-1">{hour === 0 ? '12' : hour < 12 ? hour : hour === 12 ? '12' : hour - 12}{hour < 12 ? 'AM' : 'PM'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Very High</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Moderate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {(() => {
                  const coverageRadius = adSpace.route?.coverage_radius || 5;
                  const baseCoverage = adSpace.route?.base_coverage_km || 5;
                  const increasePercent = ((coverageRadius - baseCoverage) / baseCoverage * 100).toFixed(1);
                  
                  if (coverageRadius > baseCoverage) {
                    return (
                      <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                          <p className="text-sm font-semibold text-green-800">
                            Coverage Increased by {coverageRadius - baseCoverage} km
                          </p>
                        </div>
                        <p className="text-xs text-green-700">
                          Your reach has increased by {increasePercent}% due to expanded coverage area
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                {startDate && endDate && (() => {
                  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
                  if (days > 1) {
                    return (
                      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#E91E63]" />
                          <p className="text-sm font-semibold text-blue-800">
                            Campaign Duration: {days} days
                          </p>
                        </div>
                        <p className="text-xs text-blue-700">
                          Total impressions will be {days}x the daily impressions for your campaign period
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Location Map */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location & Traffic</h2>
                <div 
                  ref={mapContainerRef}
                  className="h-96 bg-gray-200 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 relative"
                >
                  {!mapInView && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 font-medium">Loading map...</p>
                      </div>
                    </div>
                  )}
                  {mounted && mapInView && adSpace && (
                    <MapContainer
                      center={[adSpace.latitude, adSpace.longitude]}
                      zoom={adSpace.route ? 12 : 15}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                      zoomControl={true}
                      className="modern-map"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                        maxZoom={19}
                        className="apple-maps-style"
                      />
                      
                      {/* Coverage Circle for Movable Ad Spaces */}
                      {adSpace.route && (
                        <Circle
                          center={[adSpace.route.center_location.latitude, adSpace.route.center_location.longitude]}
                          radius={adSpace.route.coverage_radius * 1000} // Convert km to meters
                          pathOptions={{
                            color: '#2196F3',
                            fillColor: '#2196F3',
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: '10, 5'
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <p className="font-semibold text-sm">Coverage Area</p>
                              <p className="text-xs text-gray-600">{adSpace.route.coverage_radius} km radius</p>
                              <p className="text-xs text-gray-500 mt-1">{adSpace.route.center_location.address}</p>
                            </div>
                          </Popup>
                        </Circle>
                      )}
                      
                      {/* Traffic Level Circle - Visual indicator - ALWAYS SHOW */}
                      <TrafficCircle 
                        adSpace={adSpace}
                      />
                      
                      {/* Main Ad Space Marker */}
                      <Marker 
                        position={[adSpace.latitude, adSpace.longitude]}
                      >
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-sm mb-1">{adSpace.title}</p>
                            <p className="text-xs text-gray-600">{adSpace.location?.address || `${adSpace.latitude}, ${adSpace.longitude}`}</p>
                            {adSpace.traffic_data?.traffic_level && adSpace.traffic_data.traffic_level !== 'unknown' && (
                              <p className="text-xs mt-1">
                                <span className="font-semibold">Traffic:</span>{' '}
                                <span className="capitalize">{adSpace.traffic_data.traffic_level}</span>
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Route Center Marker (if movable) */}
                      {adSpace.route && (
                        <Marker 
                          position={[adSpace.route.center_location.latitude, adSpace.route.center_location.longitude]}
                        >
                          <Popup>
                            <div className="p-2">
                              <p className="font-semibold text-sm">Route Center</p>
                              <p className="text-xs text-gray-600">{adSpace.route.center_location.address}</p>
                              <p className="text-xs text-gray-500 mt-1">{adSpace.route.coverage_radius} km coverage</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  )}
                </div>
                
                {/* Map Legend */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                  {adSpace.route && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-dashed bg-blue-500/10 rounded-full"></div>
                      <span>Coverage Area ({adSpace.route.coverage_radius} km)</span>
                    </div>
                  )}
                  {(() => {
                    const trafficLevel = adSpace.traffic_data?.traffic_level;
                    const nearbyPlaces = adSpace.traffic_data?.nearby_places_count;
                    let displayLevel = trafficLevel;
                    
                    if (!displayLevel || displayLevel === 'unknown') {
                      if (nearbyPlaces !== undefined) {
                        if (nearbyPlaces > 20) displayLevel = 'high';
                        else if (nearbyPlaces > 10) displayLevel = 'moderate';
                        else displayLevel = 'low';
                      } else {
                        displayLevel = 'moderate';
                      }
                    }
                    
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${
                          displayLevel === 'very_high' ? 'bg-green-500' :
                          displayLevel === 'high' ? 'bg-blue-500' :
                          displayLevel === 'moderate' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="capitalize">
                          {displayLevel} Traffic Zone
                          {(!trafficLevel || trafficLevel === 'unknown') && ' (Estimated)'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Traffic Insights */}
              <div className="border-t border-gray-200 pt-6">
                <TrafficInsights
                  trafficData={adSpace.traffic_data}
                  latitude={adSpace.latitude}
                  longitude={adSpace.longitude}
                  onRefresh={handleRefreshTraffic}
                  loading={trafficLoading}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 card-shadow-lg">
                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(adSpace.price_per_day)}
                    </span>
                    <span className="text-gray-600">/day</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(adSpace.price_per_day * 30)} per month
                  </div>
                </div>

                {/* Availability */}
                {adSpace.availability_status === 'available' && (
                  <div className="flex items-center gap-2 text-[#4CAF50] mb-6 pb-6 border-b border-gray-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Available for booking</span>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-[#E91E63]" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-[#E91E63]" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                </div>

                {/* Total Calculation */}
                {startDate && endDate && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">
                        {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatPrice(
                          adSpace.price_per_day *
                          Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!startDate || !endDate}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                    startDate && endDate
                      ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add to Cart
                </button>

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>Flexible cancellation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Notification */}
      <CartNotification
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
        adSpaceTitle={adSpace?.title}
      />
    </div>
  );
}
