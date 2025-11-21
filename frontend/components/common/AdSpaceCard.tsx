'use client';

import { MapPin, CheckCircle, Eye, Users, Navigation, TrendingUp } from 'lucide-react';
import { AdSpace } from '@/types';
import Link from 'next/link';

interface AdSpaceCardProps {
  adSpace: AdSpace;
  variant?: 'default' | 'compact';
}

export default function AdSpaceCard({ adSpace, variant = 'default' }: AdSpaceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMetric = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K+`;
    }
    return value;
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#E91E63] hover:shadow-md transition-all cursor-pointer">
        <div className="flex gap-3 p-3">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {adSpace.images && adSpace.images.length > 0 ? (
              <img
                src={adSpace.images[0]}
                alt={adSpace.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
              {adSpace.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <MapPin className="w-3 h-3 text-[#E91E63]" />
              <span className="line-clamp-1">{adSpace.location?.address || adSpace.location?.city}</span>
            </div>
            {adSpace.route && (
              <div className="flex items-center gap-1 text-xs text-[#E91E63] mb-2">
                <Navigation className="w-3 h-3" />
                <span className="font-medium">{adSpace.route.base_coverage_km}km coverage</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#E91E63]">
                {formatPrice(adSpace.price_per_day)}<span className="text-xs text-gray-600 font-normal">/day</span>
              </span>
              {adSpace.availability_status === 'available' && (
                <span className="text-[10px] text-[#4CAF50] font-medium">Available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSearchUrl = () => {
    const params = new URLSearchParams();
    params.set('adSpaceId', adSpace.id);
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let startDate = urlParams.get('startDate');
      let endDate = urlParams.get('endDate');
      
      if (!startDate || !endDate) {
        const storedStartDate = sessionStorage.getItem('campaignStartDate');
        const storedEndDate = sessionStorage.getItem('campaignEndDate');
        if (storedStartDate) startDate = storedStartDate;
        if (storedEndDate) endDate = storedEndDate;
      }
      
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
    }
    return `/search?${params.toString()}`;
  };

  return (
    <Link href={getSearchUrl()} className="block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#E91E63] hover:shadow-lg transition-all cursor-pointer group">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {adSpace.images && adSpace.images.length > 0 ? (
            <img
              src={adSpace.images[0]}
              alt={adSpace.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          {adSpace.availability_status === 'available' && (
            <div className="absolute top-3 right-3 bg-[#4CAF50] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium shadow-md">
              <CheckCircle className="w-3.5 h-3.5" />
              Available
            </div>
          )}
          {adSpace.category && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md">
              {adSpace.category.name}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#E91E63] transition-colors">
            {adSpace.title}
          </h3>
          
          <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-[#E91E63] mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {adSpace.location?.address || adSpace.location?.city || 'Location not specified'}
            </span>
          </div>

          {/* Coverage Badge for Movable Ad Spaces */}
          {adSpace.route && (
            <div className="mb-3 bg-gradient-to-r from-[#E91E63]/10 to-[#F50057]/10 rounded-lg px-3 py-2 border border-[#E91E63]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#E91E63]" />
                  <span className="text-xs font-semibold text-[#E91E63]">
                    {adSpace.route.base_coverage_km}km Coverage
                  </span>
                </div>
                {adSpace.route.additional_coverage_km && adSpace.route.additional_coverage_km > 0 && (
                  <span className="text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded-full">
                    +{adSpace.route.additional_coverage_km}km available
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatMetric(adSpace.daily_impressions)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{formatMetric(adSpace.monthly_footfall)}</span>
            </div>
            {/* Traffic Level Badge */}
            {adSpace.traffic_data && (() => {
              const trafficLevel = adSpace.traffic_data.traffic_level;
              const nearbyPlaces = adSpace.traffic_data.nearby_places_count;
              
              // Determine display level
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
              
              const getTrafficBadgeColor = (level: string) => {
                switch (level) {
                  case 'very_high': return 'bg-green-100 text-green-700 border-green-200';
                  case 'high': return 'bg-blue-100 text-blue-700 border-blue-200';
                  case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                  case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
                  default: return 'bg-gray-100 text-gray-700 border-gray-200';
                }
              };
              
              const isEstimated = !trafficLevel || trafficLevel === 'unknown';
              
              return (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getTrafficBadgeColor(displayLevel)}`}>
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium capitalize text-[10px]">
                    {displayLevel} {isEstimated && '(Est)'}
                  </span>
                </div>
              );
            })()}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Starting from</div>
              <div className="text-xl font-bold text-[#E91E63]">
                {formatPrice(adSpace.price_per_day)}
                <span className="text-sm text-gray-600 font-normal">/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

