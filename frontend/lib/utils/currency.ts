/**
 * Format number as Indian Rupees (₹)
 * Handles Indian number system (lakhs, crores)
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return '₹0';
  }

  if (numAmount >= 10000000) {
    // Crores
    const crores = numAmount / 10000000;
    return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 2)} Cr`;
  } else if (numAmount >= 100000) {
    // Lakhs
    const lakhs = numAmount / 100000;
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 2)} L`;
  } else if (numAmount >= 1000) {
    // Thousands
    const thousands = numAmount / 1000;
    return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
  } else {
    return `₹${numAmount.toLocaleString('en-IN')}`;
  }
}

/**
 * Format number as Indian Rupees with full formatting (no abbreviations)
 */
export function formatINRFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '₹0';
  }
  
  return `₹${numAmount.toLocaleString('en-IN')}`;
}

/**
 * Format number with Indian number system separators
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  const numValue = Number(num);
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString('en-IN');
}

