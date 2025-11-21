'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { MapPin, Search, Edit, Trash2, Plus, Folder } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  parent_category_id?: string;
  created_at: string;
  ad_space_count?: number;
}

export default function AdminCategoriesPage() {
  const { adminUser } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container-app px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Categories Management</h1>
              <p className="text-slate-400 mt-1">Manage advertising space categories</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              Create Category
            </button>
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
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Categories</div>
            <div className="text-2xl font-bold text-white">{categories.length}</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Parent Categories</div>
            <div className="text-2xl font-bold text-white">
              {categories.filter(c => !c.parent_category_id).length}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Sub Categories</div>
            <div className="text-2xl font-bold text-white">
              {categories.filter(c => c.parent_category_id).length}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                <p className="text-slate-500">No categories found</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category.icon_url ? (
                        <img
                          src={category.icon_url}
                          alt={category.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        {category.parent_category_id && (
                          <span className="text-xs text-slate-400">Sub-category</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500">
                      {category.ad_space_count || 0} ad spaces
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

