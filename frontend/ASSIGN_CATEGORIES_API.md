# Assign Categories to Ad Spaces - API Documentation

## Endpoint
**POST** `/api/ad-spaces/assign-categories`

## Description
Automatically assigns categories to all ad spaces based on title and description keywords. This matches existing ad spaces to categories without manual assignment.

## Usage

### Option 1: Assign to ALL ad spaces (including those with categories)
```javascript
const response = await fetch('/api/ad-spaces/assign-categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});

const result = await response.json();
console.log(result);
```

### Option 2: Only assign to unmatched ad spaces
```javascript
const response = await fetch('/api/ad-spaces/assign-categories?onlyUnmatched=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});

const result = await response.json();
console.log(result);
```

### Using cURL
```bash
# Assign to all ad spaces
curl -X POST http://localhost:3000/api/ad-spaces/assign-categories

# Only assign to unmatched
curl -X POST "http://localhost:3000/api/ad-spaces/assign-categories?onlyUnmatched=true"
```

## Check Status First

Before running, check the current status:

```javascript
// GET request to see current status
const response = await fetch('/api/ad-spaces/assign-categories');
const status = await response.json();
console.log(status);
```

This will show:
- Total ad spaces
- How many are matched/unmatched
- Category breakdown
- Preview of what will be matched

## Response

### Success Response
```json
{
  "success": true,
  "message": "Category assignment completed",
  "statistics": {
    "total": 50,
    "matched": 45,
    "updated": 10,
    "skipped": 5,
    "errors": 0
  },
  "categoryBreakdown": [
    { "name": "Billboard", "count": 15 },
    { "name": "Digital Screen", "count": 20 },
    { "name": "Bus Station", "count": 10 }
  ]
}
```

## Matching Logic

The API automatically matches ad spaces to categories based on keywords:

- **Billboard**: "billboard"
- **Digital Screen**: "digital", "screen", "led", "lcd", "display"
- **Bus Station**: "bus", "bus station", "bus stop"
- **Cinema**: "cinema", "film", "movie", "theater"
- **Point of Sale**: "pos", "point of sale", "retail", "shop", "store"
- **Transit**: "transit", "metro", "train", "railway", "subway"
- **Airport**: "airport", "terminal"
- **Corporate**: "corporate", "office", "business"
- **Restaurant**: "cafe", "restaurant", "food"
- **Auto Rickshaw**: "auto", "rickshaw", "three wheeler"
- **Mall**: "mall", "shopping center"

## Complete Example

```javascript
// Step 1: Check current status
const statusResponse = await fetch('/api/ad-spaces/assign-categories');
const status = await statusResponse.json();
console.log('Current status:', status);

// Step 2: Assign categories (only to unmatched)
const assignResponse = await fetch('/api/ad-spaces/assign-categories?onlyUnmatched=true', {
  method: 'POST'
});
const result = await assignResponse.json();

if (result.success) {
  console.log('✅ Categories assigned!');
  console.log(`Updated: ${result.statistics.updated}`);
  console.log(`Skipped: ${result.statistics.skipped}`);
  console.log('Category breakdown:', result.categoryBreakdown);
} else {
  console.error('❌ Error:', result.error);
}
```

## Notes

1. **Safe to run multiple times**: The API only updates ad spaces that need updating
2. **Keyword matching**: Uses case-insensitive matching on title and description
3. **Priority order**: Checks keywords in order (Billboard first, then Digital Screen, etc.)
4. **No overwrite**: If `onlyUnmatched=true`, it won't change existing category assignments
5. **Batch processing**: Updates ad spaces one by one for reliability

## Error Handling

If there are errors during assignment, they'll be included in the response:

```json
{
  "success": true,
  "statistics": {
    "errors": 2
  },
  "errors": [
    "Ad Space Title 1: Database error message",
    "Ad Space Title 2: Another error"
  ]
}
```

