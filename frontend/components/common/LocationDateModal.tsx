'use client';

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import DateRangePicker from './DateRangePicker';
import { getCityIconPath, cityIconEmojiMap } from '@/lib/utils/cityIcons';

interface LocationDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  initialTab?: 'location' | 'dates';
}

const cities = [
  { id: 'Mumbai', name: 'Mumbai', icon: '🏛️' },
  { id: 'Delhi', name: 'Delhi-NCR', icon: '🏛️' },
  { id: 'Bengaluru', name: 'Bengaluru', icon: '🏛️' },
  { id: 'Ahmedabad', name: 'Ahmedabad', icon: '🕌' },
  { id: 'Chandigarh', name: 'Chandigarh', icon: '✋' },
  { id: 'Chennai', name: 'Chennai', icon: '🛕' },
  { id: 'Kolkata', name: 'Kolkata', icon: '🏛️' },
  { id: 'Kochi', name: 'Kochi', icon: '🌴' },
  { id: 'Pune', name: 'Pune', icon: '🏛️' },
  { id: 'Hyderabad', name: 'Hyderabad', icon: '🏛️' },
];

export default function LocationDateModal({ isOpen, onClose, onSearch, initialTab = 'location' }: LocationDateModalProps) {
  const { selectedCity, setSelectedCity } = useLocationStore();
  const { startDate, endDate, setStartDate, setEndDate } = useCampaignDatesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'location' | 'dates'>('location');

  // Update active tab when initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // City coordinates mapping
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Kochi': { lat: 9.9312, lng: 76.2673 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  };

  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
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

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
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
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Search Billboards</h2>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                activeTab === 'location'
                  ? 'text-[#E91E63] border-b-2 border-[#E91E63]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dates')}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                activeTab === 'dates'
                  ? 'text-[#E91E63] border-b-2 border-[#E91E63]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Dates</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Location Tab */}
            {activeTab === 'location' && (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your city"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-sm"
                  />
                </div>

                {/* Detect Location */}
                <button
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="flex items-center gap-2 text-[#E91E63] hover:text-[#F50057] transition-colors disabled:opacity-50"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Detecting...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Detect my location</span>
                    </>
                  )}
                </button>

                {/* Popular Cities */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Popular Cities
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city.id);
                          setSearchQuery('');
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selectedCity === city.id
                            ? 'border-[#E91E63] bg-[#E91E63]/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {getCityIconPath(city.id) ? (
                          <img 
                            src={getCityIconPath(city.id) || ''} 
                            alt={city.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const emojiSpan = target.nextElementSibling as HTMLElement;
                              if (emojiSpan) emojiSpan.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-3xl ${getCityIconPath(city.id) ? 'hidden' : ''}`}
                          style={{ display: getCityIconPath(city.id) ? 'none' : 'block' }}
                        >
                          {cityIconEmojiMap[city.id] || city.icon}
                        </span>
                        <span className={`text-xs font-medium ${
                          selectedCity === city.id ? 'text-[#E91E63]' : 'text-gray-700'
                        }`}>
                          {city.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Selection */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Selected Location</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedCity}</div>
                </div>
              </>
            )}

            {/* Dates Tab */}
            {activeTab === 'dates' && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Select Campaign Duration
                  </h3>
                  <DateRangePicker />
                </div>

                {/* Current Selection */}
                {startDate && endDate && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Selected Dates</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' - '}
                      {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Search Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <button
              onClick={() => {
                onSearch();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Search Billboards
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

