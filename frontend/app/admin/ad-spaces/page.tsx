'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { AdSpace } from '@/types';

export default function AdminAdSpacesPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    fetchAdSpaces();
  }, []);

  const fetchAdSpaces = async () => {
    try {
      const response = await fetch('/api/ad-spaces?limit=100');
      if (response.ok) {
        const result = await response.json();
        setAdSpaces(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching ad spaces:', error);
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ad-spaces/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAdSpaces(adSpaces.filter(space => space.id !== id));
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete ad space');
      }
    } catch (error) {
      console.error('Error deleting ad space:', error);
      alert('Error deleting ad space');
    }
  };

  const filteredSpaces = adSpaces.filter(space =>
    space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Ad Spaces</h1>
              <p className="text-gray-600 mt-1">
                Add, edit, or delete advertising spaces
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </Link>
              <Link
                href="/admin/ad-spaces/create"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#E91E63] to-[#F50057] rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Ad Space
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredSpaces.length} spaces found
            </div>
          </div>
        </div>

        {/* Ad Spaces Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Space
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingSpaces ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading ad spaces...
                  </td>
                </tr>
              ) : filteredSpaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No ad spaces found
                  </td>
                </tr>
              ) : (
                filteredSpaces.map((space) => (
                  <tr key={space.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {space.images && space.images[0] ? (
                          <img
                            src={space.images[0]}
                            alt={space.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{space.title}</div>
                          <div className="text-sm text-gray-500">{space.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {space.location?.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {space.display_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{space.price_per_day.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          space.availability_status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : space.availability_status === 'booked'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {space.availability_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ad-space/${space.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/ad-spaces/${space.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(space.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Ad Space?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ad space? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

