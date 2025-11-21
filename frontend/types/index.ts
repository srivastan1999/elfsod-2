export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company_name?: string;
  user_type: 'advertiser' | 'publisher' | 'admin';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_url?: string;
  parent_category_id?: string;
  description?: string;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  postal_code?: string;
}

export interface AdSpace {
  id: string;
  title: string;
  description: string;
  category_id: string;
  location_id: string;
  publisher_id: string;
  display_type: 'static_billboard' | 'digital_screen' | 'led_display' | 'backlit_panel' | 'vinyl_banner' | 'transit_branding' | 'auto_rickshaw' | 'bike' | 'cab';
  price_per_day: number;
  price_per_month: number;
  daily_impressions: number;
  monthly_footfall: number;
  target_audience: string;
  availability_status: 'available' | 'booked' | 'unavailable';
  latitude: number;
  longitude: number;
  images: string[];
  dimensions: {
    width?: number;
    height?: number;
  };
  // Coverage information for movable ad spaces
  route?: {
    center_location: { latitude: number; longitude: number; address: string };
    coverage_radius: number; // in kilometers
    base_coverage_km: number; // base coverage in km
    additional_coverage_km?: number; // additional coverage that can be added
  };
  // Traffic data from Google Maps
  traffic_data?: {
    average_daily_visitors?: number | null;
    peak_hours?: Array<{ hour: number; traffic_level: string }>;
    weekly_pattern?: Record<string, string>;
    traffic_level?: 'low' | 'moderate' | 'high' | 'very_high' | 'unknown';
    last_updated?: string;
    source?: string;
    nearby_places_count?: number;
    note?: string;
  };
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  location?: Location;
}

export interface Campaign {
  id: string;
  user_id: string;
  goal: 'brand_awareness' | 'engagement' | 'conversions' | 'traffic';
  product_description: string;
  target_audience: Record<string, any>;
  budget: number;
  start_date: string;
  end_date?: string;
  ai_generated_plan?: {
    recommended_spaces: RecommendedSpace[];
    budget_allocation: BudgetAllocation[];
    expected_results: ExpectedResults;
  };
  recommended_spaces: RecommendedSpace[];
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface RecommendedSpace {
  ad_space_id: string;
  ad_space?: AdSpace;
  reason: string;
  match_score: number;
  suggested_budget_allocation: number;
  expected_impressions: number;
  expected_reach: number;
  expected_conversions?: number;
}

export interface BudgetAllocation {
  ad_space_id: string;
  amount: number;
  percentage: number;
}

export interface ExpectedResults {
  total_impressions: number;
  total_reach: number;
  estimated_conversions: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  ad_space_id: string;
  ad_space?: AdSpace;
  start_date: string;
  end_date: string;
  quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  quote_request_id?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  ad_space_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

