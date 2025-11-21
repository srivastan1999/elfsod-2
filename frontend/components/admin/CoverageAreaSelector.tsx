'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Minus } from 'lucide-react';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface CoverageAreaSelectorProps {
  initialCenter?: { latitude: number; longitude: number; address: string };
  initialBaseRadius?: number;
  initialAdditionalRadius?: number;
  displayType?: string;
  onChange: (data: {
    center_location: { latitude: number; longitude: number; address: string };
    base_coverage_km: number;
    additional_coverage_km: number;
  }) => void;
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Default coverage by display type
const DEFAULT_COVERAGE = {
  auto_rickshaw: { base: 5, additional: 10 },
  bike: { base: 4, additional: 8 },
  cab: { base: 8, additional: 15 },
  transit_branding: { base: 12, additional: 20 },
  bus: { base: 12, additional: 20 },
  metro: { base: 15, additional: 25 },
  train: { base: 15, additional: 25 },
  mobile_billboard: { base: 10, additional: 18 },
  van: { base: 10, additional: 18 },
  default: { base: 5, additional: 10 },
};

export default function CoverageAreaSelector({
  initialCenter,
  initialBaseRadius,
  initialAdditionalRadius,
  displayType = 'default',
  onChange,
}: CoverageAreaSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [centerLocation, setCenterLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  }>(
    initialCenter || {
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Mumbai, India',
    }
  );

  // Get default coverage based on display type
  const getDefaultCoverage = () => {
    const type = displayType.toLowerCase();
    return DEFAULT_COVERAGE[type as keyof typeof DEFAULT_COVERAGE] || DEFAULT_COVERAGE.default;
  };

  const defaults = getDefaultCoverage();
  const [baseRadius, setBaseRadius] = useState(initialBaseRadius || defaults.base);
  const [additionalRadius, setAdditionalRadius] = useState(initialAdditionalRadius || defaults.additional);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Notify parent component of changes
    onChange({
      center_location: centerLocation,
      base_coverage_km: baseRadius,
      additional_coverage_km: additionalRadius,
    });
  }, [centerLocation, baseRadius, additionalRadius, onChange]);

  const handleMapClick = async (lat: number, lng: number) => {
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      setCenterLocation({
        latitude: lat,
        longitude: lng,
        address: address,
      });
    } catch (error) {
      setCenterLocation({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Click on the map</strong> to set the coverage center point, then adjust the radius using the controls below.
        </p>
      </div>

      {/* Map */}
      <div className="relative h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        <MapContainer
          center={[centerLocation.latitude, centerLocation.longitude]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          className="modern-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
            className="apple-maps-style"
          />
          <MapClickHandler onClick={handleMapClick} />
          
          {/* Base Coverage Circle */}
          <Circle
            center={[centerLocation.latitude, centerLocation.longitude]}
            radius={baseRadius * 1000}
            color="#2196F3"
            fillColor="#2196F3"
            fillOpacity={0.1}
            weight={2}
          />
          
          {/* Total Coverage Circle (Base + Additional) */}
          <Circle
            center={[centerLocation.latitude, centerLocation.longitude]}
            radius={(baseRadius + additionalRadius) * 1000}
            color="#E91E63"
            fillColor="#E91E63"
            fillOpacity={0.15}
            weight={3}
            dashArray="10, 5"
          />
          
          {/* Center Marker */}
          <Marker
            position={[centerLocation.latitude, centerLocation.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [35, 51],
              iconAnchor: [17, 51],
            })}
          />
        </MapContainer>
        
        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2 text-xs z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 bg-blue-500/10 rounded"></div>
            <span>Base Coverage: {baseRadius}km</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#E91E63] border-dashed bg-[#E91E63]/15 rounded"></div>
            <span>Max Coverage: {baseRadius + additionalRadius}km</span>
          </div>
        </div>
      </div>

      {/* Coverage Center Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#E91E63] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">Coverage Center</p>
            <p className="text-xs text-gray-600">{centerLocation.address}</p>
            <p className="text-xs text-gray-400 mt-1">
              {centerLocation.latitude.toFixed(6)}, {centerLocation.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Radius Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Base Radius */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Base Coverage Radius
          </label>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setBaseRadius(Math.max(1, baseRadius - 1))}
              className="p-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-blue-600" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-blue-700">{baseRadius}</span>
              <span className="text-sm text-gray-600 ml-1">km</span>
            </div>
            <button
              type="button"
              onClick={() => setBaseRadius(baseRadius + 1)}
              className="p-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={baseRadius}
            onChange={(e) => setBaseRadius(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-gray-600 mt-2">
            Guaranteed coverage included in base price
          </p>
        </div>

        {/* Additional Radius */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Additional Coverage (Optional)
          </label>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setAdditionalRadius(Math.max(0, additionalRadius - 1))}
              className="p-2 bg-white border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-pink-600" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-pink-700">+{additionalRadius}</span>
              <span className="text-sm text-gray-600 ml-1">km</span>
            </div>
            <button
              type="button"
              onClick={() => setAdditionalRadius(additionalRadius + 1)}
              className="p-2 bg-white border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-pink-600" />
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={additionalRadius}
            onChange={(e) => setAdditionalRadius(Number(e.target.value))}
            className="w-full accent-pink-600"
          />
          <p className="text-xs text-gray-600 mt-2">
            Can be purchased by customers at extra cost
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-[#E91E63]/10 to-[#F50057]/10 border border-[#E91E63]/30 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Base Coverage</p>
            <p className="text-lg font-bold text-blue-700">{baseRadius} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Max Coverage</p>
            <p className="text-lg font-bold text-[#E91E63]">{baseRadius + additionalRadius} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Coverage Area</p>
            <p className="text-lg font-bold text-gray-900">
              {(Math.PI * Math.pow(baseRadius + additionalRadius, 2)).toFixed(0)} km²
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

