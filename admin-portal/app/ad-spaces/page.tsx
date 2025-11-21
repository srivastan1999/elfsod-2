'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LayoutGrid, Search, Edit, Trash2, Plus, Eye, MapPin } from 'lucide-react';
import Link from 'next/link';

interface AdSpace {
  id: string;
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    city: string;
    state: string;
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
}

export default function AdminAdSpacesPage() {
  const { adminUser } = useAdminAuth();
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdSpaces();
  }, []);

  const fetchAdSpaces = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch('/api/ad-spaces', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdSpaces(data.adSpaces || []);
      }
    } catch (error) {
      console.error('Error fetching ad spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad space? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch(`/api/ad-spaces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setAdSpaces(adSpaces.filter(space => space.id !== id));
        // Show success message
        alert('Ad space deleted successfully');
      } else {
        let errorMessage = result.error || 'Failed to delete ad space';
        if (result.details) {
          errorMessage += `\n\nDetails: ${result.details}`;
        }
        if (result.hint) {
          errorMessage += `\n\nHint: ${result.hint}`;
        }
        alert(errorMessage);
        console.error('Delete ad space error:', result);
      }
    } catch (error) {
      console.error('Error deleting ad space:', error);
      alert('Error deleting ad space. Check console for details.');
    }
  };

  const filteredSpaces = adSpaces.filter(space =>
    space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.location?.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'booked':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'unavailable':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container-app px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Ad Spaces Management</h1>
              <p className="text-slate-400 mt-1">Manage all advertising spaces on the platform</p>
            </div>
            <Link
              href="/ad-spaces/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Ad Space
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ad spaces by title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Ad Spaces</div>
            <div className="text-2xl font-bold text-white">{adSpaces.length}</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Available</div>
            <div className="text-2xl font-bold text-green-400">
              {adSpaces.filter(s => s.availability_status === 'available').length}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Booked</div>
            <div className="text-2xl font-bold text-orange-400">
              {adSpaces.filter(s => s.availability_status === 'booked').length}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Unavailable</div>
            <div className="text-2xl font-bold text-red-400">
              {adSpaces.filter(s => s.availability_status === 'unavailable').length}
            </div>
          </div>
        </div>

        {/* Ad Spaces Table */}
        {loading ? (
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading ad spaces...</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Ad Space
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Price/Day
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-700">
                {filteredSpaces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No ad spaces found
                    </td>
                  </tr>
                ) : (
                  filteredSpaces.map((space) => (
                    <tr key={space.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {space.images && space.images[0] ? (
                            <img
                              src={space.images[0]}
                              alt={space.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                              <LayoutGrid className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{space.title}</div>
                            <div className="text-xs text-slate-400 line-clamp-1">{space.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-300">
                          {space.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          {space.location?.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {space.display_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ₹{space.price_per_day.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(space.availability_status)}`}>
                          {space.availability_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/ad-spaces/${space.id}`}
                            className="text-blue-400 hover:text-blue-300"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/ad-spaces/${space.id}/edit`}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(space.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

