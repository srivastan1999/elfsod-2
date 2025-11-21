'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl, CircleMarker } from 'react-leaflet';
import { AdSpace } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Create custom SVG markers - Apple Maps inspired style
const createCustomIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 44 : 36;
  const radius = isSelected ? 16 : 14;
  const innerRadius = isSelected ? 7 : 6;
  const uniqueId = `marker-${Math.random().toString(36).substr(2, 9)}`;
  
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${uniqueId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="3" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="gradient-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.85" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="url(#gradient-${uniqueId})" filter="url(#shadow-${uniqueId})" stroke="white" stroke-width="${isSelected ? 3.5 : 2.5}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${innerRadius}" fill="white" opacity="0.95"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker apple-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size / 2],
  });
};

// Component to update map center when selected ad space changes with smooth animation
function MapCenterUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapComponentProps {
  adSpaces: AdSpace[];
  onMarkerClick?: (adSpace: AdSpace) => void;
  selectedId?: string;
  selectedAdSpace?: AdSpace | null;
}

export default function MapComponent({ adSpaces, onMarkerClick, selectedId, selectedAdSpace }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  // Create custom icons with better design - always call hooks, but return undefined if not ready
  const defaultIcon = useMemo(() => {
    if (!mounted || typeof window === 'undefined' || !L) return undefined;
    return createCustomIcon('#E91E63', false);
  }, [mounted]);
  
  const selectedIcon = useMemo(() => {
    if (!mounted || typeof window === 'undefined' || !L) return undefined;
    return createCustomIcon('#2196F3', true);
  }, [mounted]);
  
  const coverageIcon = useMemo(() => {
    if (!mounted || typeof window === 'undefined' || !L) return undefined;
    return createCustomIcon('#4CAF50', true);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-200px)] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₹${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}k`;
    }
    return `₹${price}`;
  };

  // Calculate center and bounds from selected ad space, or first ad space, or default to Mumbai
  const getCenter = (): [number, number] => {
    if (selectedAdSpace) {
      // If it has a route/coverage, center on the coverage center
      if (selectedAdSpace.route) {
        return [
          selectedAdSpace.route.center_location.latitude,
          selectedAdSpace.route.center_location.longitude
        ];
      }
      return [selectedAdSpace.latitude, selectedAdSpace.longitude];
    }
    if (selectedId) {
      const selectedSpace = adSpaces.find(s => s.id === selectedId);
      if (selectedSpace) {
        if (selectedSpace.route) {
          return [
            selectedSpace.route.center_location.latitude,
            selectedSpace.route.center_location.longitude
          ];
        }
        return [selectedSpace.latitude, selectedSpace.longitude];
      }
    }
    if (adSpaces.length > 0) {
      return [adSpaces[0].latitude, adSpaces[0].longitude];
    }
    return [19.0760, 72.8777]; // Mumbai coordinates
  };

  const center = getCenter();
  // Zoom based on coverage radius - larger radius needs more zoom out
  const getZoom = (): number => {
    if (selectedAdSpace?.route) {
      const radiusKm = selectedAdSpace.route.coverage_radius;
      // Zoom levels: 5km=13, 8km=12, 10km=11, 15km=10, 20km=9, 25km=8
      if (radiusKm <= 5) return 13;
      if (radiusKm <= 8) return 12;
      if (radiusKm <= 10) return 11;
      if (radiusKm <= 15) return 10;
      if (radiusKm <= 20) return 9;
      return 8;
    }
    return selectedId ? 15 : 13;
  };
  const zoom = getZoom();

  return (
    <div 
      className="relative h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-2xl border-2 border-gray-200"
      style={{ position: 'relative', zIndex: 0 }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        key={`map-${selectedId || 'default'}`}
        scrollWheelZoom={true}
        zoomControl={false}
        className="modern-map"
      >
        {/* Apple Maps style tiles - clean, modern, and elegant */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          className="apple-maps-style"
        />
        <ZoomControl position="bottomright" />
        <MapCenterUpdater center={center} zoom={zoom} />
        
        {/* Show coverage radius for movable ad spaces */}
        {selectedAdSpace?.route && (
          <>
            {/* Outer coverage circle - Apple Maps style soft glow */}
            <Circle
              center={[
                selectedAdSpace.route.center_location.latitude,
                selectedAdSpace.route.center_location.longitude
              ]}
              radius={selectedAdSpace.route.coverage_radius * 1000}
              pathOptions={{
                color: '#E91E63',
                fillColor: '#E91E63',
                fillOpacity: 0.06,
                weight: 1.5,
                dashArray: '20, 12',
                opacity: 0.4,
              }}
            />
            
            {/* Inner coverage circle - Apple Maps style */}
            <Circle
              center={[
                selectedAdSpace.route.center_location.latitude,
                selectedAdSpace.route.center_location.longitude
              ]}
              radius={selectedAdSpace.route.coverage_radius * 1000}
              pathOptions={{
                color: '#E91E63',
                fillColor: '#E91E63',
                fillOpacity: 0.18,
                weight: 2.5,
                opacity: 0.7,
              }}
            />
            
            {/* Center marker */}
            {coverageIcon && (
            <Marker
              position={[
                selectedAdSpace.route.center_location.latitude,
                selectedAdSpace.route.center_location.longitude
              ]}
              icon={coverageIcon}
            >
              <Popup className="modern-popup" closeButton={true}>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <p className="font-bold text-sm text-gray-900">
                      Coverage Center
                    </p>
                  </div>
                  <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                    {selectedAdSpace.route.center_location.address}
                  </p>
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-pink-50 rounded-lg border border-pink-200">
                    <span className="text-xs font-semibold text-pink-700">
                      {selectedAdSpace.route.coverage_radius} km radius
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
            )}
          </>
        )}
        
        {/* Traffic circles for all ad spaces */}
        {adSpaces.map((space) => {
          const trafficLevel = space.traffic_data?.traffic_level;
          const nearbyPlaces = space.traffic_data?.nearby_places_count;
          
          // Determine traffic level: use actual level, or estimate from nearby places, or default
          let displayLevel = trafficLevel;
          if (!displayLevel || displayLevel === 'unknown') {
            if (nearbyPlaces !== undefined) {
              if (nearbyPlaces > 20) displayLevel = 'high';
              else if (nearbyPlaces > 10) displayLevel = 'moderate';
              else if (nearbyPlaces > 5) displayLevel = 'moderate';
              else displayLevel = 'low';
            } else {
              displayLevel = 'moderate'; // Default
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
          const isSelected = selectedId === space.id;
          
          // Show traffic circle for all ad spaces - fixed 1km radius
          const trafficRadius = 1000; // Fixed 1km radius
          
          // Get traffic size/amount for display
          const getTrafficSize = () => {
            if (space.traffic_data?.average_daily_visitors) {
              const visitors = space.traffic_data.average_daily_visitors;
              if (visitors >= 1000) return `${(visitors / 1000).toFixed(1)}K`;
              return visitors.toString();
            }
            if (space.daily_impressions && space.daily_impressions > 0) {
              const impressions = space.daily_impressions;
              if (impressions >= 1000) return `${(impressions / 1000).toFixed(1)}K`;
              return impressions.toString();
            }
            if (nearbyPlaces !== undefined) {
              return `${nearbyPlaces} places`;
            }
            return null;
          };
          
          const trafficSize = getTrafficSize();
          
          // Create text label icon for traffic size
          const createTrafficLabelIcon = (text: string | null, level: string, isSelected: boolean) => {
            if (!text) return null;
            
            const bgColor = level === 'very_high' ? '#10B981' :
                           level === 'high' ? '#3B82F6' :
                           level === 'moderate' ? '#F59E0B' : '#6B7280';
            
            const iconSize = isSelected ? 60 : 50;
            const fontSize = isSelected ? '14px' : '12px';
            
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
                font-size: ${fontSize};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                text-align: center;
                line-height: 1;
              ">
                ${text}
              </div>
            `;
            
            return L.divIcon({
              html: svgIcon,
              className: 'traffic-label-marker',
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2],
            });
          };
          
          const labelIcon = trafficSize ? createTrafficLabelIcon(trafficSize, displayLevel, isSelected) : null;
          
          return (
            <React.Fragment key={`traffic-group-${space.id}`}>
              <Circle
                key={`traffic-${space.id}`}
                center={[space.latitude, space.longitude]}
                radius={trafficRadius} // Fixed 1km radius
                pathOptions={{
                  color: colors.color,
                  fillColor: colors.fillColor,
                  fillOpacity: isSelected ? 0.25 : 0.15, // More visible when selected
                  weight: isSelected ? 4 : 2, // Thicker when selected
                  dashArray: isEstimated ? '8, 4' : undefined,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-semibold text-sm">{space.title}</p>
                    <p className="font-semibold text-xs mt-1">Traffic Level {isEstimated && '(Estimated)'}</p>
                    <p className="text-xs text-gray-600 capitalize">{displayLevel} Traffic</p>
                    {space.traffic_data?.average_daily_visitors ? (
                      <p className="text-xs text-gray-500 mt-1">
                        ~{space.traffic_data.average_daily_visitors.toLocaleString()} daily visitors
                      </p>
                    ) : nearbyPlaces !== undefined ? (
                      <p className="text-xs text-gray-500 mt-1">
                        {nearbyPlaces} nearby places
                      </p>
                    ) : null}
                  </div>
                </Popup>
              </Circle>
              
              {/* Traffic size label marker at center */}
              {labelIcon && (
                <Marker
                  key={`traffic-label-${space.id}`}
                  position={[space.latitude, space.longitude]}
                  icon={labelIcon}
                  zIndexOffset={1000} // Ensure it's above the circle
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold text-sm">{space.title}</p>
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
            </React.Fragment>
          );
        })}
        
        {/* Regular markers */}
        {adSpaces.map((space) => {
          const markerIcon = selectedId === space.id 
            ? (selectedIcon || defaultIcon) 
            : defaultIcon;
          
          if (!markerIcon) return null;
          
          return (
            <Marker
              key={space.id}
              position={[space.latitude, space.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(space);
                  }
                },
              }}
            >
              <Popup className="modern-popup" closeButton={true} autoPan={true}>
                <div className="p-4 min-w-[240px]">
                  <h3 className="font-bold text-base text-gray-900 mb-2 leading-tight">
                    {space.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-bold rounded-lg shadow-sm">
                      {formatPrice(space.price_per_day * 30)}/mo
                    </span>
                  </div>
                  {space.route && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <span className="font-semibold">Coverage:</span> {space.route.coverage_radius} km radius
                      </p>
                      <p className="text-xs text-blue-700 mt-1 truncate">
                        {space.route.center_location.address}
                      </p>
                    </div>
                  )}
                  {space.traffic_data?.traffic_level && space.traffic_data.traffic_level !== 'unknown' && (
                    <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800 capitalize">
                        <span className="font-semibold">Traffic:</span> {space.traffic_data.traffic_level}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => onMarkerClick && onMarkerClick(space)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

