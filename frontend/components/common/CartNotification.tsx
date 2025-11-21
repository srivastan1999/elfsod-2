'use client';

import { useEffect } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  adSpaceTitle?: string;
}

export default function CartNotification({ isVisible, onClose, adSpaceTitle }: CartNotificationProps) {
  const router = useRouter();

  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          {/* Success Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">Added to Cart!</h3>
            {adSpaceTitle && (
              <p className="text-sm text-gray-600 truncate mb-3">
                {adSpaceTitle}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewCart}
                className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

