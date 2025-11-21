-- ============================================
-- CREATE CATEGORIES FOR ELFSOD
-- Run this in Supabase SQL Editor BEFORE creating ad spaces
-- ============================================

-- Insert main categories
INSERT INTO categories (name, description, icon_url) VALUES
('Billboards', 'Traditional and digital billboard advertising', NULL),
('Auto Rickshaw Advertising', 'Mobile advertising on auto rickshaws', NULL),
('Bus Shelter Advertising', 'Advertising at bus stops and shelters', NULL),
('Metro Advertising', 'Advertising in metro stations and trains', NULL),
('Digital Screens', 'LED and digital display advertising', NULL),
('Mall Advertising', 'Advertising in shopping malls and retail spaces', NULL),
('Cinema Advertising', 'Advertising in movie theaters and cinemas', NULL),
('Airport Advertising', 'Advertising at airports and terminals', NULL),
('Transit Advertising', 'General transit and transportation advertising', NULL),
('Corporate Advertising', 'Advertising in corporate offices and tech parks', NULL),
('Retail Advertising', 'Point-of-sale and retail space advertising', NULL),
('Event Venue Advertising', 'Advertising at event spaces and venues', NULL)
ON CONFLICT (name) DO NOTHING;

-- Verify categories created
SELECT id, name, description, parent_category_id, created_at
FROM categories
ORDER BY name;
