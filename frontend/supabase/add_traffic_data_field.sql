-- Add traffic_data JSONB field to ad_spaces table
-- This field stores traffic insights from Google Maps

ALTER TABLE ad_spaces 
ADD COLUMN IF NOT EXISTS traffic_data JSONB DEFAULT NULL;

-- Add index for faster queries on traffic data
CREATE INDEX IF NOT EXISTS idx_ad_spaces_traffic_data 
ON ad_spaces USING GIN (traffic_data);

-- Add comment to explain the field
COMMENT ON COLUMN ad_spaces.traffic_data IS 'Traffic insights from Google Maps including average daily visitors, peak hours, weekly patterns, and traffic levels';

