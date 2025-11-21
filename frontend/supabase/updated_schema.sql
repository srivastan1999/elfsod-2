-- Elfsod Database Schema for Supabase (Updated)

-- Enable UUID extension (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publishers table
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Spaces table
CREATE TABLE IF NOT EXISTS ad_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  location_id UUID REFERENCES locations(id),
  publisher_id UUID REFERENCES publishers(id),
  display_type VARCHAR(50) NOT NULL CHECK (display_type IN ('static_billboard', 'digital_screen', 'led_display', 'backlit_panel', 'vinyl_banner', 'transit_branding')),
  price_per_day DECIMAL(12, 2) NOT NULL,
  price_per_month DECIMAL(12, 2) NOT NULL,
  daily_impressions INTEGER DEFAULT 0,
  monthly_footfall INTEGER DEFAULT 0,
  target_audience VARCHAR(255),
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked', 'unavailable')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  dimensions JSONB DEFAULT '{}'::jsonb,
  route JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id VARCHAR(255) UNIQUE NOT NULL,
  user_email VARCHAR(255),
  items JSONB NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  promo_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items table (updated with approval status)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  ad_space_id UUID REFERENCES ad_spaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL,
  approval_status VARCHAR(20) DEFAULT NULL CHECK (approval_status IN (NULL, 'pending', 'approved', 'rejected')),
  quote_request_id VARCHAR(255) REFERENCES quote_requests(quote_request_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  ad_space_id UUID REFERENCES ad_spaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id VARCHAR(255),
  quote_request_id VARCHAR(255) REFERENCES quote_requests(quote_request_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_spaces_location ON ad_spaces(location_id);
CREATE INDEX IF NOT EXISTS idx_ad_spaces_category ON ad_spaces(category_id);
CREATE INDEX IF NOT EXISTS idx_ad_spaces_publisher ON ad_spaces(publisher_id);
CREATE INDEX IF NOT EXISTS idx_ad_spaces_coordinates ON ad_spaces(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ad_spaces_price ON ad_spaces(price_per_month);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_quote ON cart_items(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_bookings_ad_space ON bookings(ad_space_id);

-- Row Level Security (RLS) Policies
ALTER TABLE ad_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read ad spaces, categories, locations, publishers
CREATE POLICY "Ad spaces are viewable by everyone" ON ad_spaces
  FOR SELECT USING (true);

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Locations are viewable by everyone" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Publishers are viewable by everyone" ON publishers
  FOR SELECT USING (true);

-- Policy: Quote requests are viewable by everyone (for now, can be restricted later)
CREATE POLICY "Quote requests are viewable by everyone" ON quote_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create quote requests" ON quote_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update quote requests" ON quote_requests
  FOR UPDATE USING (true);

-- Policy: Cart items are viewable by everyone (for local storage simulation)
CREATE POLICY "Cart items are viewable by everyone" ON cart_items
  FOR ALL USING (true);

-- Policy: Bookings are viewable by everyone (for now)
CREATE POLICY "Bookings are viewable by everyone" ON bookings
  FOR ALL USING (true);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ad_spaces_updated_at BEFORE UPDATE ON ad_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

