'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  MapPin, 
  LayoutGrid, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAdSpaces: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalAdSpaces: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch stats from API
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Ad Spaces',
      value: stats.totalAdSpaces,
      icon: LayoutGrid,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-[#E91E63] to-[#F50057]',
      bgColor: 'bg-pink-50',
      textColor: 'text-[#E91E63]',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Ad Spaces',
      description: 'Add, edit, or delete ad spaces',
      icon: LayoutGrid,
      href: '/admin/ad-spaces',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit categories',
      icon: MapPin,
      href: '/admin/categories',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'View Bookings',
      description: 'Monitor all bookings',
      icon: Eye,
      href: '/admin/bookings',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.full_name}! Manage your platform from here.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              <Link
                href="/admin/users"
                className="text-sm text-[#E91E63] hover:text-[#F50057] font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {loadingStats ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
              <Link
                href="/admin/bookings"
                className="text-sm text-[#E91E63] hover:text-[#F50057] font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {loadingStats ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent bookings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
