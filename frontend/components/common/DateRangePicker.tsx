'use client';

import { Calendar } from 'lucide-react';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';

interface DateRangePickerProps {
  onDatesChange?: (startDate: string, endDate: string) => void;
}

export default function DateRangePicker({ onDatesChange }: DateRangePickerProps) {
  const { startDate, endDate, setStartDate, setEndDate } = useCampaignDatesStore();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (endDate && newStartDate > endDate) {
      setEndDate('');
    }
    onDatesChange?.(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onDatesChange?.(startDate, newEndDate);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Start Date */}
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">Start date</label>
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={getTodayDate()}
            className="w-full px-4 py-3 pr-4 border-2 border-[#E91E63] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E63] cursor-pointer bg-white"
            style={{
              paddingLeft: '3.5rem',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          />
          <div className="absolute inset-0 left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2 z-0">
            <Calendar className="w-5 h-5 text-[#E91E63] flex-shrink-0" />
            {startDate ? (
              <div className="flex flex-col">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(startDate)}
                </div>
                <div className="text-xs text-gray-500">Start date</div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Select date</div>
            )}
          </div>
        </div>
      </div>

      {/* End Date */}
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">End date</label>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || getTodayDate()}
            disabled={!startDate}
            className={`w-full px-4 py-3 pr-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E63] cursor-pointer ${
              !startDate
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-[#E91E63] bg-white'
            }`}
            style={{
              paddingLeft: '3.5rem',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          />
          <div className={`absolute inset-0 left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2 z-0 ${
            !startDate ? 'opacity-50' : ''
          }`}>
            <Calendar className={`w-5 h-5 flex-shrink-0 ${!startDate ? 'text-gray-300' : 'text-[#E91E63]'}`} />
            {endDate ? (
              <div className="flex flex-col">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(endDate)}
                </div>
                <div className="text-xs text-gray-500">End date</div>
              </div>
            ) : (
              <div className={`text-sm ${!startDate ? 'text-gray-300' : 'text-gray-400'}`}>
                {!startDate ? 'Select start date first' : 'Select date'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

