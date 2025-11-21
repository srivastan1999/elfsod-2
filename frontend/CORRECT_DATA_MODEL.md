# ✅ Correct Data Model Understanding

## Core Concept

### Ad Spaces
- **What**: A list of different advertising spaces at different locations
- **Examples**: "MG Road Digital Screen", "BKC Premium Billboard", "Metro Train Interior Display"
- **Purpose**: The actual advertising locations/spaces available for booking

### Categories
- **What**: Ways to group/organize ad spaces
- **Examples**: "Office Spaces", "Billboards", "Metro", "Restaurant", "Hotel"
- **Purpose**: Categorize ad spaces for easier filtering and organization

## Relationships

### 1. Ad Spaces → Categories (One-to-Many)
```
ad_spaces.category_id → categories.id
```
- Each ad space belongs to ONE category
- Example: "BKC Premium Billboard" → category: "Billboard"
- Example: "Office Building Elevator Display" → category: "Office Tower"

### 2. Categories → Categories (Parent-Child Hierarchy)
```
categories.parent_category_id → categories.id
```
- Categories can have parent categories for organization
- Example: "Billboard" → parent: "Outdoor Advertising"
- Example: "Corporate" → parent: "Corporate & Business"
- Example: "Mall" → parent: "Retail & Commerce"

## Correct Structure

```
📁 Categories (for organizing ad spaces)
  ├─ 📁 Outdoor Advertising (parent category)
  │   └─ 📂 Billboard (child category)
  │       └─ 🏢 Ad Spaces: "BKC Premium Billboard", "MG Road Billboard", etc.
  │
  ├─ 📁 Corporate & Business (parent category)
  │   ├─ 📂 Corporate (child category)
  │   │   └─ 🏢 Ad Spaces: "Corporate Elevator Display", etc.
  │   └─ 📂 Office Tower (child category)
  │       └─ 🏢 Ad Spaces: "Office Building Elevator Display", etc.
  │
  ├─ 📁 Retail & Commerce (parent category)
  │   ├─ 📂 Mall (child category)
  │   ├─ 📂 Grocery Store (child category)
  │   └─ 📂 Restaurant (child category)
  │
  └─ ... (other categories)

🏢 Ad Spaces (actual advertising locations)
  - Each ad space has: category_id → points to a category
  - Each ad space is at a specific location
  - Each ad space has pricing, availability, etc.
```

## What Was Wrong

❌ **Incorrect**: `parent_category_id` pointing to `ad_spaces.id`
- This doesn't make sense - categories organize ad spaces, not the other way around

✅ **Correct**: `parent_category_id` pointing to `categories.id`
- Creates a hierarchy of categories (parent categories and child categories)
- Example: "Outdoor Advertising" (parent) → "Billboard" (child)

## Database Schema

```sql
-- Ad Spaces table
ad_spaces (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category_id UUID REFERENCES categories(id),  -- ✅ Links to category
  location_id UUID,
  ...
)

-- Categories table
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parent_category_id UUID REFERENCES categories(id),  -- ✅ Links to parent category
  description TEXT,
  ...
)
```

## Summary

- **ad_spaces** = The actual advertising locations
- **categories** = Ways to organize/group ad spaces
- **ad_spaces.category_id** → **categories.id** (ad space belongs to category)
- **categories.parent_category_id** → **categories.id** (category hierarchy)

---

**Status**: ✅ Data model clarified and corrected

