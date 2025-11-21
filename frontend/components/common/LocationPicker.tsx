'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';

const cities = ['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];

// City coordinates mapping (approximate centers)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
};

// Reverse geocoding function to get city from coordinates
const getCityFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    // Using a simple distance-based approach to find nearest city
    let nearestCity = 'Mumbai';
    let minDistance = Infinity;

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return nearestCity;
  } catch (error) {
    console.error('Error getting city from coordinates:', error);
    return null;
  }
};

export default function LocationPicker() {
  const { selectedCity, setSelectedCity } = useLocationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  useEffect(() => {
    // Request location on component mount
    if (!hasRequestedLocation && navigator.geolocation) {
      setIsDetecting(true);
      setHasRequestedLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoordinates(latitude, longitude);
          if (city) {
            setSelectedCity(city);
          }
          setIsDetecting(false);
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          setIsDetecting(false);
          // Keep default city (Mumbai) if location is denied
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, [hasRequestedLocation, setSelectedCity]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-900 active:opacity-70 transition-opacity"
        disabled={isDetecting}
      >
        <MapPin className="w-5 h-5 text-[#E91E63]" />
        {isDetecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#E91E63]" />
            <span className="font-medium text-sm">Detecting...</span>
          </>
        ) : (
          <>
            <span className="font-medium text-sm">{selectedCity}</span>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      
      {isOpen && !isDetecting && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 min-w-[200px] overflow-hidden">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                  selectedCity === city ? 'text-[#E91E63] font-semibold bg-[#E91E63]/5' : 'text-gray-900'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

