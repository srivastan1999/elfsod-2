/**
 * Utility to get category icon paths from local assets
 */

// Category name to icon filename mapping
// Handles case variations and spelling differences
// Based on actual files in public/assets/category-icons/
const categoryIconMap: Record<string, string> = {
  // Airport Advertising
  'Airport Advertising': 'lounge.png', // Using lounge as airport lounge
  'Airport': 'lounge.png',
  
  // Auto Rickshaw Advertising
  'Auto Rickshaw Advertising': 'auto.icon png.png',
  'Auto Rickshaw': 'auto.icon png.png',
  'Tricycle': 'tricycle ads.png',
  'Tricycle Advertising': 'tricycle ads.png',
  
  // Billboards
  'Billboards': 'Static billboard-2.png',
  'Billboard': 'Static billboard-2.png',
  'Static Billboard': 'Static billboard-2.png',
  
  // Bus Shelter Advertising
  'Bus Shelter Advertising': 'bus-stop.png',
  'Bus Shelter': 'bus-stop.png',
  'Bus Stop': 'bus-stop.png',
  'Bus Station': 'bus-stop.png',
  
  // Cinema Advertising
  'Cinema Advertising': 'cinema.png',
  'Cinema': 'cinema.png',
  'Cinema Screens': 'cinema.png',
  
  // Corporate Advertising
  'Corporate Advertising': 'advertising.png',
  'Corporate': 'advertising.png',
  'Office': 'advertising.png',
  
  // Digital Screens
  'Digital Screens': 'Digital billboard.png',
  'Digital Screen': 'Digital billboard.png',
  'Digital Billboard': 'Digital billboard.png',
  'Digital': 'Digital billboard.png',
  
  // Event Venue Advertising
  'Event Venue Advertising': 'event.png',
  'Event Venue': 'event.png',
  'Event': 'event.png',
  'Events': 'event.png',
  
  // Mall Advertising
  'Mall Advertising': 'lounge.png', // Using lounge as mall lounge
  'Mall': 'lounge.png',
  'Shopping Mall': 'lounge.png',
  
  // Metro Advertising
  'Metro Advertising': 'train.png',
  'Metro': 'train.png',
  'Metro Station': 'train.png',
  
  // Retail Advertising
  'Retail Advertising': 'look walker.png', // Using look walker for retail
  'Retail': 'look walker.png',
  'Retail Store': 'look walker.png',
  
  // Transit Advertising
  'Transit Advertising': 'transport.png',
  'Transit': 'transport.png',
  'Transport': 'transport.png',
  'Public Transport': 'transport.png',
  
  // Additional mappings
  'Bus': 'bus.png',
  'Cab': 'cab.png',
  'Taxi': 'cab.png',
  'Bridge': 'bridge.png',
  'Drone': 'drone.png',
  'Lounge': 'lounge.png',
  'Train': 'train-2.png',
  'Railway': 'train-2.png',
};

/**
 * Normalize category name for matching
 */
function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get the local asset path for a category icon
 * @param categoryName - Name of the category (e.g., "Billboards", "Cinema Advertising")
 * @returns Local asset path to the category icon
 */
export function getCategoryIconPath(categoryName: string): string | null {
  if (!categoryName) return null;

  // Try exact match first
  const iconFile = categoryIconMap[categoryName];
  if (iconFile) {
    return `/assets/category-icons/${encodeURIComponent(iconFile)}`;
  }

  // Try case-insensitive match
  const categoryLower = categoryName.toLowerCase();
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (key.toLowerCase() === categoryLower) {
      return `/assets/category-icons/${encodeURIComponent(value)}`;
    }
  }

  // Try normalized match
  const normalized = normalizeCategoryName(categoryName);
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (normalizeCategoryName(key) === normalized) {
      return `/assets/category-icons/${encodeURIComponent(value)}`;
    }
  }

  // Try partial match
  for (const [key, value] of Object.entries(categoryIconMap)) {
    const keyNormalized = normalizeCategoryName(key);
    if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
      return `/assets/category-icons/${encodeURIComponent(value)}`;
    }
  }

  return null;
}

/**
 * Get category icon with fallback
 * @param categoryName - Name of the category
 * @param fallbackUrl - URL from database to use as fallback
 * @returns Icon path (local asset preferred, then fallback URL)
 */
export function getCategoryIcon(categoryName: string, fallbackUrl?: string | null): string | null {
  const localIcon = getCategoryIconPath(categoryName);
  if (localIcon) {
    return localIcon;
  }
  return fallbackUrl || null;
}

