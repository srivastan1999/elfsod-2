'use client';

import { TrendingUp, Users, Clock, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface TrafficData {
  average_daily_visitors?: number | null;
  peak_hours?: Array<{ hour: number; traffic_level: string }>;
  weekly_pattern?: Record<string, string>;
  traffic_level?: 'low' | 'moderate' | 'high' | 'very_high' | 'unknown';
  last_updated?: string;
  source?: string;
  nearby_places_count?: number;
  note?: string;
}

interface TrafficInsightsProps {
  trafficData?: TrafficData;
  latitude: number;
  longitude: number;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function TrafficInsights({ 
  trafficData, 
  latitude, 
  longitude, 
  onRefresh,
  loading = false 
}: TrafficInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!trafficData || trafficData.traffic_level === 'unknown') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Traffic Insights</h3>
              <p className="text-sm text-gray-600">Data from Google Maps</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh traffic data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4" />
          <p>Traffic data not available. Click refresh to fetch from Google Maps.</p>
        </div>
      </div>
    );
  }

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'text-green-600 bg-green-50 border-green-200';
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrafficLabel = (level: string) => {
    switch (level) {
      case 'very_high': return 'Very High';
      case 'high': return 'High';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Traffic Insights</h3>
            <p className="text-sm text-gray-600">Data from Google Maps</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh traffic data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Traffic Level Badge */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getTrafficColor(trafficData.traffic_level || 'unknown')}`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span className="font-semibold text-sm">
            {getTrafficLabel(trafficData.traffic_level || 'unknown')} Traffic
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Daily Visitors */}
        {trafficData.average_daily_visitors && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Average Daily Visitors</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {trafficData.average_daily_visitors.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Estimated from Google Maps data</p>
          </div>
        )}

        {/* Nearby Places */}
        {trafficData.nearby_places_count !== undefined && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Nearby Places</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {trafficData.nearby_places_count}
            </p>
            <p className="text-xs text-gray-500 mt-1">Places within 500m radius</p>
          </div>
        )}

        {/* Peak Hours */}
        {trafficData.peak_hours && trafficData.peak_hours.length > 0 && (
          <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Peak Hours</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }, (_, hour) => {
                const peakHour = trafficData.peak_hours?.find(ph => ph.hour === hour);
                const level = peakHour?.traffic_level || 'low';
                const height = level === 'very_high' ? 'h-8' : level === 'high' ? 'h-6' : level === 'moderate' ? 'h-4' : 'h-2';
                const color = level === 'very_high' ? 'bg-green-500' : level === 'high' ? 'bg-blue-500' : level === 'moderate' ? 'bg-yellow-500' : 'bg-gray-300';
                
                return (
                  <div key={hour} className="flex flex-col items-center">
                    <div className={`w-full ${height} ${color} rounded-t mb-1`}></div>
                    {hour % 3 === 0 && (
                      <span className="text-xs text-gray-500">{formatHour(hour)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Pattern */}
        {trafficData.weekly_pattern && (
          <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Weekly Traffic Pattern</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const level = trafficData.weekly_pattern?.[day] || 'moderate';
                const color = level === 'very_high' ? 'bg-green-500' : level === 'high' ? 'bg-blue-500' : level === 'moderate' ? 'bg-yellow-500' : 'bg-gray-300';
                const height = level === 'very_high' ? 'h-16' : level === 'high' ? 'h-12' : level === 'moderate' ? 'h-8' : 'h-4';
                
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div className={`w-full ${height} ${color} rounded-t mb-2`}></div>
                    <span className="text-xs font-medium text-gray-700">{dayLabels[index]}</span>
                    <span className="text-xs text-gray-500 capitalize">{level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      {trafficData.last_updated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(trafficData.last_updated).toLocaleString()}
          </p>
        </div>
      )}

      {trafficData.note && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">{trafficData.note}</p>
        </div>
      )}
    </div>
  );
}

