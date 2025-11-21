'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ArrowLeft, Edit, MapPin, DollarSign, Eye, Calendar, Users, Target } from 'lucide-react';
import Link from 'next/link';

interface AdSpace {
  id: string;
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
    icon_url?: string;
    description?: string;
  };
  location?: {
    id: string;
    city: string;
    state: string;
    country: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  publisher?: {
    id: string;
    name: string;
    description?: string;
  };
  display_type: string;
  price_per_day: number;
  price_per_month: number;
  availability_status: string;
  latitude: number;
  longitude: number;
  images?: string[];
  daily_impressions?: number;
  monthly_footfall?: number;
  target_audience?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
}

export default function ViewAdSpacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdSpace();
  }, [id]);

  const fetchAdSpace = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch(`/api/ad-spaces/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedAdSpace = data.adSpace;
        
        if (!fetchedAdSpace) {
          setError('Ad space not found');
          return;
        }
        
        setAdSpace(fetchedAdSpace);
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to load ad space';
        if (errorData.details) {
          errorMessage += `\n\nDetails: ${errorData.details}`;
        }
        if (errorData.hint) {
          errorMessage += `\n\nHint: ${errorData.hint}`;
        }
        setError(errorMessage);
        console.error('Error fetching ad space:', errorData);
      }
    } catch (error) {
      console.error('Error fetching ad space:', error);
      setError('Error loading ad space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'booked':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/50';
      case 'unavailable':
        return 'bg-red-500/10 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container-app px-4 py-8">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading ad space...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !adSpace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container-app px-4 py-8">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-8">
            <div className="text-red-400 mb-4">{error || 'Ad space not found'}</div>
            <button
              onClick={() => router.push('/ad-spaces')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Ad Spaces
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container-app px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/ad-spaces"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{adSpace.title}</h1>
              <p className="text-slate-400 mt-1">{adSpace.description}</p>
            </div>
          </div>
          <Link
            href={`/ad-spaces/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {adSpace.images && adSpace.images.length > 0 ? (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Images</h2>
                <div className="grid grid-cols-2 gap-4">
                  {adSpace.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${adSpace.title} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No images available</p>
              </div>
            )}

            {/* Description */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{adSpace.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(adSpace.availability_status)}`}>
                {adSpace.availability_status}
              </span>
            </div>

            {/* Category */}
            {adSpace.category && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Category</h2>
                <p className="text-slate-300">{adSpace.category.name}</p>
                {adSpace.category.description && (
                  <p className="text-sm text-slate-400 mt-2">{adSpace.category.description}</p>
                )}
              </div>
            )}

            {/* Location */}
            {adSpace.location && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h2>
                <div className="space-y-2 text-slate-300">
                  {adSpace.location.address && (
                    <p>{adSpace.location.address}</p>
                  )}
                  <p>{adSpace.location.city}, {adSpace.location.state}</p>
                  <p className="text-sm text-slate-400">{adSpace.location.country}</p>
                  {(adSpace.location.latitude && adSpace.location.longitude) && (
                    <p className="text-xs text-slate-500 mt-2">
                      Coordinates: {adSpace.location.latitude.toFixed(6)}, {adSpace.location.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Per Day</p>
                  <p className="text-2xl font-bold text-white">₹{adSpace.price_per_day.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Per Month</p>
                  <p className="text-2xl font-bold text-white">₹{(adSpace.price_per_day * 30).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Display Type */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Display Type</h2>
              <p className="text-slate-300 capitalize">{adSpace.display_type.replace(/_/g, ' ')}</p>
            </div>

            {/* Stats */}
            {(adSpace.daily_impressions || adSpace.monthly_footfall) && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Statistics
                </h2>
                <div className="space-y-3">
                  {adSpace.daily_impressions !== undefined && (
                    <div>
                      <p className="text-sm text-slate-400">Daily Impressions</p>
                      <p className="text-lg font-semibold text-white">{adSpace.daily_impressions.toLocaleString()}</p>
                    </div>
                  )}
                  {adSpace.monthly_footfall !== undefined && (
                    <div>
                      <p className="text-sm text-slate-400">Monthly Footfall</p>
                      <p className="text-lg font-semibold text-white">{adSpace.monthly_footfall.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {adSpace.target_audience && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Audience
                </h2>
                <p className="text-slate-300">{adSpace.target_audience}</p>
              </div>
            )}

            {/* Dimensions */}
            {adSpace.dimensions && (adSpace.dimensions.width || adSpace.dimensions.height) && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Dimensions</h2>
                <p className="text-slate-300">
                  {adSpace.dimensions.width} × {adSpace.dimensions.height} px
                </p>
              </div>
            )}

            {/* Publisher */}
            {adSpace.publisher && (
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Publisher</h2>
                <p className="text-slate-300">{adSpace.publisher.name}</p>
                {adSpace.publisher.description && (
                  <p className="text-sm text-slate-400 mt-2">{adSpace.publisher.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

