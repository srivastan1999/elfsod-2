/**
 * Utility to get city icon paths from local assets
 */

// City name to icon filename mapping
// Handles case variations and spelling differences
// Based on actual files in public/assets/city-icons/
const cityIconMap: Record<string, string> = {
  'Mumbai': 'mumbai.png',
  'Delhi': 'delhi.png',
  'Delhi-NCR': 'delhi.png',
  'Bengaluru': 'bengaluru.png',
  'Bangalore': 'bengaluru.png',
  'Ahmedabad': 'Ahmedabad.png',
  'Chandigarh': 'delhi.png', // Fallback to Delhi if not available
  'Chennai': 'chennai.png',
  'Kolkata': 'kolkata.png',
  'Kochi': 'kerela.png', // Kerala icon for Kochi
  'Kerala': 'kerela.png',
  'Pune': 'pune.png',
  'Hyderabad': 'Hyderabad.png',
  'Jaipur': 'jaipur.png',
};

/**
 * Get the local asset path for a city icon
 * @param cityName - Name of the city (e.g., "Mumbai", "Delhi")
 * @returns Local asset path to the city icon
 */
export function getCityIconPath(cityName: string): string | null {
  // Try exact match first
  const iconFile = cityIconMap[cityName];
  if (iconFile) {
    return `/assets/city-icons/${iconFile}`;
  }

  // Try case-insensitive match
  const cityLower = cityName.toLowerCase();
  for (const [key, value] of Object.entries(cityIconMap)) {
    if (key.toLowerCase() === cityLower) {
      return `/assets/city-icons/${value}`;
    }
  }

  // Try to match by normalizing the name
  const normalized = cityName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  // Check if any icon filename matches
  const iconFiles = [
    'mumbai.png', 'pune.png', 'kolkata.png', 'kerela.png', 'delhi.png',
    'jaipur.png', 'chennai.png', 'Hyderabad.png', 'bengaluru.png', 'Ahmedabad.png'
  ];

  for (const iconFile of iconFiles) {
    const iconName = iconFile.toLowerCase().replace('.png', '');
    if (normalized.includes(iconName) || iconName.includes(normalized)) {
      return `/assets/city-icons/${iconFile}`;
    }
  }

  return null;
}

/**
 * Get city icon with fallback emoji
 * @param cityName - Name of the city
 * @param fallbackEmoji - Emoji to use if icon not found
 * @returns Icon path or emoji fallback
 */
export function getCityIcon(cityName: string, fallbackEmoji: string = '🏛️'): string {
  const iconPath = getCityIconPath(cityName);
  return iconPath || fallbackEmoji;
}

/**
 * Fallback emoji map for cities
 */
export const cityIconEmojiMap: Record<string, string> = {
  'Mumbai': '🏛️',
  'Delhi': '🏛️',
  'Bengaluru': '🏛️',
  'Ahmedabad': '🕌',
  'Chandigarh': '✋',
  'Chennai': '🛕',
  'Kolkata': '🏛️',
  'Kochi': '🌴',
  'Pune': '🏛️',
  'Hyderabad': '🏛️',
  'Jaipur': '🏛️',
};

