# Elfsod - User Flow Guide

## Complete Booking Flow with Sample Data

The application now includes 8 sample ad spaces with images, descriptions, and locations.

---

## 📍 Sample Ad Spaces Included

### Billboard Category
1. **MG Road Billboard** - Bengaluru
   - ₹60,000/day (₹18,00,000/month)
   - 8K daily impressions, 240K monthly footfall
   - Location: MG Road, Bengaluru

2. **Brigade Road Billboard** - Bengaluru
   - ₹40,000/day (₹12,00,000/month)
   - 6K daily impressions, 180K monthly footfall
   - Location: Brigade Road, Bengaluru

3. **Andheri Billboard** - Mumbai
   - ₹50,000/day (₹15,00,000/month)
   - 7K daily impressions, 210K monthly footfall
   - Location: Andheri West, Mumbai

### Digital Screens
4. **Digital Screen at BKC** - Mumbai
   - ₹83,333/day (₹25,00,000/month)
   - 5K daily impressions, 150K monthly footfall
   - Target: Corporate Professionals

5. **Metro Station Digital Display** - Delhi
   - ₹45,000/day (₹13,50,000/month)
   - 10K daily impressions, 300K monthly footfall
   - Target: Metro Commuters

6. **Shopping Mall LED Display** - Mumbai
   - ₹55,000/day (₹16,50,000/month)
   - 12K daily impressions, 360K monthly footfall
   - Target: Shoppers & Families

### Other Categories
7. **Airport Terminal Billboard** - Mumbai
   - ₹1,00,000/day (₹30,00,000/month)
   - 15K daily impressions, 450K monthly footfall
   - Target: Travelers & Business Professionals

8. **Bus Station Billboard** - Pune
   - ₹25,000/day (₹7,50,000/month)
   - 4K daily impressions, 120K monthly footfall
   - Target: Daily Commuters

---

## 🎯 Complete User Flow

### Step 1: Home Page
**URL**: `http://localhost:3000`

**What you see**:
- Hero section with gradient
- Stats bar
- **5 category cards** (matching your image):
  - Bus Station (gray)
  - **Billboard (pink)** ← Your focus
  - Point of Sale (blue)
  - Cinema Screens (purple)
  - Airport (green)
- Trending ad spaces (4 cards)
- Recommended ad spaces (4 cards)

**Action**: Click on "Billboard" category card

---

### Step 2: Search Page (Google Maps Style)
**URL**: `http://localhost:3000/search?category=billboard`

**Layout**:
- **Left Panel (400px)**:
  - Search bar
  - Filter button
  - Results count: "3 ad spaces found"
  - List of billboard cards:
    - MG Road Billboard
    - Brigade Road Billboard
    - Andheri Billboard

- **Right Panel (Map)**:
  - Interactive map centered on billboards
  - 3 red markers showing billboard locations
  - Zoom controls

**Action**: Click on any billboard card OR click on a map marker

---

### Step 3: Slide-in Detail Panel
**Animation**: Slides in from right (450px width)

**What you see**:
- ✅ Close button (X) at top-right
- ✅ Large hero image
- ✅ Title: "Digital Screen at BKC"
- ✅ Location with pin icon
- ✅ Price display:
  - ₹83,333/day (large, bold)
  - ₹25,00,000 per month
- ✅ Description
- ✅ Audience & Reach (2 cards):
  - Daily Impressions: 5K+
  - Monthly Footfall: 150K+

**Booking Section**:
- ✅ Start Date picker
- ✅ End Date picker
- ✅ Duration calculation (auto-updates)
- ✅ Total Cost display (pink background)
- ✅ **Add to Cart Button**:
  - Gradient (pink to red)
  - Disabled until both dates selected
  - Shows "Add to Cart →"

**Action**: 
1. Select start date (e.g., Nov 20, 2025)
2. Select end date (e.g., Dec 20, 2025)
3. See calculated cost
4. Click "Add to Cart"

---

### Step 4: Added to Cart
**What happens**:
- Alert message: "Added to cart!"
- Panel closes automatically
- Map marker stays blue (selected)
- Cart badge in sidebar updates (shows "1")

**Action**: Click "Cart" in sidebar

---

### Step 5: Cart Page
**URL**: `http://localhost:3000/cart`

**Layout**:
- **Left side (2/3 width)**:
  - Header: "Shopping Cart"
  - Item count
  - Cart item cards showing:
    - Thumbnail image
    - Title and location
    - Date range
    - Subtotal

- **Right side (1/3 width)**:
  - Order Summary card (sticky)
  - Promo code input
  - Price breakdown:
    - Subtotal
    - Tax & Fees (18%)
    - **Total** (in red)
  - "Proceed to Checkout" button
  - Security badge

**Actions**:
- View all items
- Remove items
- Apply promo code
- Proceed to checkout

---

## 🎨 Visual Design Details

### Category Cards (Home Page)
Based on your image:
- **Billboard card**:
  - Pink background (`bg-pink-50`)
  - Pink gradient icon (`from-[#E91E63] to-[#F50057]`)
  - Border on selection
  - Hover effects
  - "150 spaces" count

### Slide-in Panel Design
Following your Digital Screen reference:
- Hero image at top
- Title: Large, bold
- Location: Pin icon + address
- Price: Blue color for daily rate
- "Available" badge in green
- Audience metrics with icons
- Professional date pickers
- Gradient "Add to Cart" button

### Card List Format
Matching your "RECOMMENDED HIGH TRAFFIC ZONE" image:
- Card with large image
- Title below image
- Location with pin icon
- Price in red/pink
- Horizontal scrolling on home
- Grid on search page

---

## 🚀 Test the Complete Flow

1. **Start**: Open `http://localhost:3000`
2. **Click**: Billboard category (pink card)
3. **View**: Map with 3 billboard markers
4. **Click**: Any billboard marker or card
5. **See**: Slide-in panel from right
6. **Select**: Start and end dates
7. **Click**: Add to Cart button
8. **Go to**: Cart (sidebar)
9. **Review**: All items and total
10. **Complete**: Proceed to checkout

---

## 📊 Sample Data Details

Each ad space includes:
- ✅ Title and description
- ✅ Category (Billboard, Digital Screen, etc.)
- ✅ Location (with coordinates for map)
- ✅ Pricing (daily and monthly)
- ✅ Metrics (impressions, footfall)
- ✅ Target audience
- ✅ High-quality placeholder images
- ✅ Availability status

---

## 🎯 Key Features Working

✅ Category filtering
✅ Map with markers
✅ Marker highlighting (red → blue)
✅ Slide-in panel animation
✅ Date selection
✅ Cost calculation
✅ Add to cart
✅ Cart management
✅ Professional design
✅ All colors from documentation

---

**Everything is working! Test it now at http://localhost:3000**

