# ✅ Associate Similar Ad Spaces to Category API

## Overview

Single API endpoint that takes a category name and automatically associates ad spaces (cards) with similar names to that category.

## API Endpoint

```
POST /api/categories/associate-similar-adspaces
```

## Request Body

```json
{
  "categoryName": "Restaurant"
}
```

### Parameters

- **categoryName** (required): The name of the category (e.g., "Restaurant", "Metro", "Hotel", "Billboard")
- **similarityThreshold** (optional): Minimum similarity score (0-1), default: 0.3

## How It Works

1. **Finds the category** by name (case-insensitive)
2. **Searches all ad spaces** for titles/descriptions containing the category name
3. **Associates matching ad spaces** to the category by updating their `category_id`
4. **Returns statistics** about what was matched

## Matching Logic

The API matches ad spaces where:
- Title contains the category name (e.g., "Restaurant" matches "Restaurant Entrance Banner")
- Description contains the category name
- Any keyword from the category name appears in title/description

## Example Usage

### Associate Restaurant ad spaces

```bash
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Restaurant"}'
```

### Associate Metro ad spaces

```bash
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Metro"}'
```

### Associate Hotel ad spaces

```bash
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Hotel"}'
```

## Response Format

```json
{
  "success": true,
  "message": "Associated ad spaces with similar names to \"Restaurant\"",
  "category": {
    "id": "4619bb27-fe8c-4356-a050-9cd28d250176",
    "name": "Restaurant"
  },
  "statistics": {
    "totalMatchingAdSpaces": 5,
    "successfullyAssociated": 5,
    "failed": 0,
    "newlyUpdated": 2,
    "alreadyInCategory": 3,
    "totalAdSpacesInCategory": 3
  },
  "matchedAdSpaces": [
    {
      "id": "8e0c4d4b-4786-49a2-8e6a-0f9e3fe42db1",
      "title": "Restaurant Entrance Banner",
      "success": true
    },
    {
      "id": "f7bcc718-921e-4fb2-b039-917caa08d7dc",
      "title": "Restaurant Table Top Display",
      "success": true
    }
  ]
}
```

## Response Fields

- **success**: Whether the operation succeeded
- **category**: The category that was matched
- **statistics**:
  - `totalMatchingAdSpaces`: Number of ad spaces found with similar names
  - `successfullyAssociated`: Number successfully associated
  - `failed`: Number that failed to update
  - `newlyUpdated`: Number that were newly updated (not already in category)
  - `alreadyInCategory`: Number that were already in the category
  - `totalAdSpacesInCategory`: Total ad spaces now in this category
- **matchedAdSpaces**: Array of ad spaces that were matched

## Example: Associate All Categories

You can run this for all your categories:

```bash
# Restaurant
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Restaurant"}'

# Metro
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Metro"}'

# Hotel
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Hotel"}'

# Corporate
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Corporate"}'

# Office Tower
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Office Tower"}'

# Mall
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Mall"}'

# Grocery Store
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Grocery Store"}'

# Event Venue
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Event Venue"}'

# Billboard
curl -X POST "http://localhost:3000/api/categories/associate-similar-adspaces" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Billboard"}'
```

## Error Responses

### Category Not Found (404)
```json
{
  "success": false,
  "error": "Category not found",
  "details": "No category found matching \"InvalidCategory\""
}
```

### Missing Category Name (400)
```json
{
  "success": false,
  "error": "Category name is required"
}
```

## Benefits

1. **Simple**: Just provide category name, no need to know IDs
2. **Automatic**: Finds and matches ad spaces automatically
3. **Smart Matching**: Searches both title and description
4. **Safe**: Only updates ad spaces that match, doesn't affect others
5. **Informative**: Returns detailed statistics about what was matched

---

**Status**: ✅ Ready to use - Just provide category name and it will find and associate matching ad spaces!

