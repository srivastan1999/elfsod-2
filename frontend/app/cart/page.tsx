'use client';

import { useState, useEffect } from 'react';
import { Trash2, Calendar, ArrowRight, ShoppingBag, Tag, Lock, MapPin, Mail, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, removeItem, updateItem, getTotal, clearCart, markItemsAsPending, getPendingCount, mergeGuestCart, setUserId } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const pendingCount = getPendingCount();

  // Set user ID and merge guest cart when user signs in
  useEffect(() => {
    if (user && !authLoading) {
      setUserId(user.id);
      mergeGuestCart(user.id);
    } else if (!user && !authLoading) {
      setUserId(null);
    }
  }, [user, authLoading, mergeGuestCart, setUserId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSubtotal = (item: any) => {
    const days = Math.ceil(
      (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return (item.ad_space?.price_per_day || 0) * days * item.quantity;
  };

  const subtotal = getTotal();
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleRequestQuote = async () => {
    if (!user) {
      router.push('/auth/signin?redirect=/cart');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          items: items.map(item => ({
            id: item.id,
            ad_space: {
              id: item.ad_space_id,
              title: item.ad_space?.title || 'Unknown',
              price_per_day: item.ad_space?.price_per_day || 0,
              location: item.ad_space?.location,
              images: item.ad_space?.images,
            },
            start_date: item.start_date,
            end_date: item.end_date,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
          subtotal,
          tax,
          total,
          promoCode: promoCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote request');
      }

      // Mark items as pending instead of clearing cart
      if (data.quoteRequestId) {
        markItemsAsPending(data.quoteRequestId);
      }

      setSubmitStatus('success');
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error requesting quote:', error);
      setSubmitStatus('error');
      alert(error instanceof Error ? error.message : 'Failed to send quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Discover amazing ad spaces to kickstart your campaign</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Browse Ad Spaces
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="container-app px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left - Cart Items */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
                <p className="text-gray-600">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                  {pendingCount > 0 && (
                    <span className="ml-2 text-yellow-600 font-medium">
                      • {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending approval
                    </span>
                  )}
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.ad_space?.images?.[0] ? (
                        <img
                          src={item.ad_space.images[0]}
                          alt={item.ad_space.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900">
                              {item.ad_space?.title}
                            </h3>
                            {item.approval_status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                <Clock className="w-3 h-3" />
                                Pending Approval
                              </span>
                            )}
                            {item.approval_status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            )}
                            {item.approval_status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#E91E63]" />
                            {item.ad_space?.location?.address}
                          </p>
                        </div>
                        {item.approval_status !== 'pending' && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Dates and Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(item.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                              {' - '}
                              {new Date(item.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(calculateSubtotal(item))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 card-shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Promo Code */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1 text-[#E91E63]" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-sm"
                    />
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax & Fees (18%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-[#E91E63]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Request Quote Button */}
                <button
                  onClick={handleRequestQuote}
                  disabled={isSubmitting || items.length === 0 || pendingCount > 0}
                  className={`w-full bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white text-center py-4 rounded-lg font-semibold transition-all mb-4 flex items-center justify-center gap-2 ${
                    isSubmitting || items.length === 0 || pendingCount > 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Quote Requested!
                    </>
                  ) : pendingCount > 0 ? (
                    <>
                      <Clock className="w-5 h-5" />
                      Waiting for Approval
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Request Quote
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ✓ Quote request sent successfully! Your items are now pending admin approval. You'll be notified once approved.
                    </p>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      ✗ Failed to send quote request. Please try again.
                    </p>
                  </div>
                )}

                {/* Info Badge */}
                <div className="text-center text-xs text-gray-500">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Quote will be sent to bureau@elfsod.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
