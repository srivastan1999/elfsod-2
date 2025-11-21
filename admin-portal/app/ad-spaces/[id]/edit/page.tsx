'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ArrowLeft, Save, Plus, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function EditAdSpacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    displayType: 'static_billboard',
    pricePerDay: '',
    pricePerMonth: '',
    dailyImpressions: '0',
    monthlyFootfall: '0',
    latitude: '',
    longitude: '',
    availabilityStatus: 'available',
    targetAudience: '',
    images: [] as string[],
    dimensionsWidth: '1920',
    dimensionsHeight: '1080',
    // Movable space fields
    numberOfVehicles: '',
    coverageRadius: '',
    baseCoverageKm: '',
    additionalCoverageKm: '',
    routeDescription: '',
  });
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // Check if display type is movable
  const isMovableSpace = ['auto_rickshaw', 'bus', 'bike', 'cab', 'truck', 'transit_branding'].includes(formData.displayType);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    fetchAdSpace();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch('/api/locations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleLocationChange = (locationId: string) => {
    const selectedLocation = locations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      setFormData({
        ...formData,
        locationId: locationId,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
      });
    } else {
      setFormData({
        ...formData,
        locationId: locationId,
      });
    }
  };

  const handleAddImageUrl = () => {
    const trimmedUrl = imageUrlInput.trim();
    if (trimmedUrl && !formData.images.includes(trimmedUrl)) {
      setFormData({
        ...formData,
        images: [...formData.images, trimmedUrl],
      });
      setImageUrlInput('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || url.startsWith('http');
    } catch {
      return false;
    }
  };

  const fetchAdSpace = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch(`/api/ad-spaces/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const adSpace = data.adSpace;
        
        if (!adSpace) {
          alert('Ad space not found');
          router.push('/ad-spaces');
          return;
        }
        
        // Use location coordinates if available, otherwise use ad space coordinates
        const latitude = adSpace.location?.latitude || adSpace.latitude;
        const longitude = adSpace.location?.longitude || adSpace.longitude;
        
        // Extract route data if it exists
        const route = adSpace.route || {};
        
        setFormData({
          title: adSpace.title || '',
          description: adSpace.description || '',
          categoryId: adSpace.category_id || '',
          locationId: adSpace.location_id || '',
          displayType: adSpace.display_type || 'static_billboard',
          pricePerDay: adSpace.price_per_day?.toString() || '',
          pricePerMonth: adSpace.price_per_month?.toString() || '',
          dailyImpressions: adSpace.daily_impressions?.toString() || '0',
          monthlyFootfall: adSpace.monthly_footfall?.toString() || '0',
          latitude: latitude?.toString() || '',
          longitude: longitude?.toString() || '',
          availabilityStatus: adSpace.availability_status || 'available',
          targetAudience: adSpace.target_audience || '',
          images: Array.isArray(adSpace.images) ? adSpace.images : [],
          dimensionsWidth: adSpace.dimensions?.width?.toString() || '1920',
          dimensionsHeight: adSpace.dimensions?.height?.toString() || '1080',
          // Movable space fields
          numberOfVehicles: route.number_of_vehicles?.toString() || '',
          coverageRadius: route.coverage_radius?.toString() || '',
          baseCoverageKm: route.base_coverage_km?.toString() || '',
          additionalCoverageKm: route.additional_coverage_km?.toString() || '',
          routeDescription: route.route_description || '',
        });
      } else {
        const error = await response.json();
        let errorMessage = error.error || 'Failed to load ad space';
        if (error.details) {
          errorMessage += `\n\nDetails: ${error.details}`;
        }
        if (error.hint) {
          errorMessage += `\n\nHint: ${error.hint}`;
        }
        alert(errorMessage);
        console.error('Error fetching ad space:', error);
        router.push('/ad-spaces');
      }
    } catch (error) {
      console.error('Error fetching ad space:', error);
      alert('Error loading ad space. Redirecting...');
      router.push('/ad-spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch(`/api/ad-spaces/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          locationId: formData.locationId || null,
          displayType: formData.displayType,
          pricePerDay: parseFloat(formData.pricePerDay),
          pricePerMonth: parseFloat(formData.pricePerMonth),
          dailyImpressions: parseInt(formData.dailyImpressions),
          monthlyFootfall: parseInt(formData.monthlyFootfall),
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          availabilityStatus: formData.availabilityStatus,
          targetAudience: formData.targetAudience || null,
          images: formData.images,
          dimensions: {
            width: parseInt(formData.dimensionsWidth),
            height: parseInt(formData.dimensionsHeight),
          },
          // Movable space route data
          ...(isMovableSpace && {
            route: {
              center_location: formData.locationId && formData.latitude && formData.longitude ? {
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                address: locations.find(l => l.id === formData.locationId)?.address || ''
              } : null,
              coverage_radius: formData.coverageRadius ? parseFloat(formData.coverageRadius) : null,
              base_coverage_km: formData.baseCoverageKm ? parseFloat(formData.baseCoverageKm) : null,
              additional_coverage_km: formData.additionalCoverageKm ? parseFloat(formData.additionalCoverageKm) : null,
              number_of_vehicles: formData.numberOfVehicles ? parseInt(formData.numberOfVehicles) : null,
              route_description: formData.routeDescription || null,
            }
          }),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/ad-spaces');
      } else {
        let errorMessage = result.error || 'Failed to update ad space';
        if (result.details) {
          errorMessage += `\n\nDetails: ${result.details}`;
        }
        if (result.hint) {
          errorMessage += `\n\nHint: ${result.hint}`;
        }
        alert(errorMessage);
        console.error('Update ad space error:', result);
      }
    } catch (error) {
      console.error('Error updating ad space:', error);
      alert('Error updating ad space');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading ad space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container-app px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/ad-spaces"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Ad Space</h1>
              <p className="text-slate-400 mt-1">Update advertising space details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isMovableSpace ? 'Base Location (Optional)' : 'Location *'}
              </label>
              <select
                required={!isMovableSpace}
                value={formData.locationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.address} - {loc.city}, {loc.state}
                  </option>
                ))}
              </select>
              {isMovableSpace && (
                <p className="mt-1 text-xs text-slate-500">
                  For movable spaces, location is optional. You can specify coverage area below.
                </p>
              )}
            </div>

            {/* Display Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Type *
              </label>
              <select
                required
                value={formData.displayType}
                onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <optgroup label="Static Spaces">
                  <option value="static_billboard">Static Billboard</option>
                  <option value="digital_screen">Digital Screen</option>
                  <option value="led_display">LED Display</option>
                  <option value="backlit_panel">Backlit Panel</option>
                  <option value="vinyl_banner">Vinyl Banner</option>
                </optgroup>
                <optgroup label="Movable Spaces">
                  <option value="bus">Bus</option>
                  <option value="auto_rickshaw">Auto Rickshaw</option>
                  <option value="bike">Bike</option>
                  <option value="cab">Cab/Taxi</option>
                  <option value="truck">Truck</option>
                  <option value="transit_branding">Transit Branding</option>
                </optgroup>
              </select>
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Availability Status *
              </label>
              <select
                required
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price Per Day (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Price Per Month */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price Per Month (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Daily Impressions */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Daily Impressions
              </label>
              <input
                type="number"
                min="0"
                value={formData.dailyImpressions}
                onChange={(e) => setFormData({ ...formData, dailyImpressions: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Monthly Footfall */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Monthly Footfall
              </label>
              <input
                type="number"
                min="0"
                value={formData.monthlyFootfall}
                onChange={(e) => setFormData({ ...formData, monthlyFootfall: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isMovableSpace ? 'Base Latitude' : 'Latitude *'} <span className="text-xs text-slate-500">(Auto-filled from location)</span>
              </label>
              <input
                type="number"
                required={!isMovableSpace}
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-filled from selected location"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isMovableSpace ? 'Base Longitude' : 'Longitude *'} <span className="text-xs text-slate-500">(Auto-filled from location)</span>
              </label>
              <input
                type="number"
                required={!isMovableSpace}
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-filled from selected location"
              />
            </div>
            
            {/* Movable Space Fields */}
            {isMovableSpace && (
              <>
                <div className="md:col-span-2 border-t border-slate-700 pt-6 mt-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Movable Space Details</h3>
                </div>
                
                {/* Number of Vehicles */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Vehicles
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfVehicles}
                    onChange={(e) => setFormData({ ...formData, numberOfVehicles: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
                
                {/* Coverage Radius */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Coverage Radius (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.coverageRadius}
                    onChange={(e) => setFormData({ ...formData, coverageRadius: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50"
                  />
                </div>
                
                {/* Base Coverage */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Base Coverage (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.baseCoverageKm}
                    onChange={(e) => setFormData({ ...formData, baseCoverageKm: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
                
                {/* Additional Coverage */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Coverage (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.additionalCoverageKm}
                    onChange={(e) => setFormData({ ...formData, additionalCoverageKm: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50"
                  />
                </div>
                
                {/* Route Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Route Description
                  </label>
                  <textarea
                    value={formData.routeDescription}
                    onChange={(e) => setFormData({ ...formData, routeDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Covers major routes in city center, connects residential areas to business districts"
                  />
                </div>
              </>
            )}

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Width (px)
              </label>
              <input
                type="number"
                min="0"
                value={formData.dimensionsWidth}
                onChange={(e) => setFormData({ ...formData, dimensionsWidth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Height (px)
              </label>
              <input
                type="number"
                min="0"
                value={formData.dimensionsHeight}
                onChange={(e) => setFormData({ ...formData, dimensionsHeight: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Target Audience */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Image URLs */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Image URLs
              </label>
              <div className="space-y-3">
                {/* Add Image URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {/* Image URL List */}
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    {formData.images.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isValidImageUrl(url) ? (
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-300 truncate" title={url}>
                                {url}
                              </p>
                              {!isValidImageUrl(url) && (
                                <p className="text-xs text-yellow-400 mt-1">Invalid image URL</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.images.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No images added. Add image URLs above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              href="/ad-spaces"
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

