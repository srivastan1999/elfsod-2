# Elfsod - Complete Project Documentation

## Project Overview

Elfsod is an advertising inventory aggregator platform that connects advertisers with various advertising mediums including static billboards, digital screens, transit branding, influencer marketing, and more. The platform provides a seamless experience for discovering, planning, booking, and managing advertising campaigns.

## Core Value Proposition

- **Unified Platform**: Single platform to access diverse advertising inventories
- **AI-Powered Planning**: Intelligent campaign planning and recommendations
- **Location-Based Discovery**: Map-based search and filtering
- **Transparent Pricing**: Clear pricing and availability information
- **Real-Time Availability**: Live inventory status and booking

---

## Advertising Inventory Types

### 1. Static Billboards
- Traditional outdoor billboards
- Various sizes and locations
- High-traffic zones

### 2. Digital Screens
- College digital screens
- Shopping mall displays
- Corporate office screens
- LED displays
- Backlit panels

### 3. Transit Branding
- Auto rickshaw branding
- Metro station branding
- Metro pillars
- Bus branding
- Bus stops
- Taxi/Cab branding

### 4. Influencer Marketing
- Social media influencers
- Content creators
- Brand ambassadors

### 5. Out-of-Home (OOH) Advertising
- Skywalks
- Foot over bridges
- Street furniture
- Public parks

### 6. Mobility Advertising
- Rapido bikes
- Transit vehicles
- Airport displays

### 7. Retail & Mall Advertising
- Shopping malls
- Retail stores
- Supermarkets
- Department stores
- Food courts
- Store entrances

### 8. Corporate & Office Advertising
- IT Parks
- Office buildings
- Business parks
- Co-working spaces
- Corporate cafeterias
- Office lobbies

### 9. Lifestyle & Hospitality
- Hotels
- Restaurants
- Venues

---

## Core Features

### 1. Home Screen with Location Picker

#### Header Section
- **App Title**: "It All Starts Here!" (large, bold)
- **Location Picker**: 
  - Red pin icon
  - City name display (e.g., "Mumbai", "Bengaluru")
  - Dropdown arrow indicator
  - Clickable to change city
  - Location-based filtering of all content
- **User Profile Icon**: Circular icon in top right corner

#### Category Selection
Horizontal scrollable row of category icons with labels:
- **Bus Station** (bus stop icon)
- **Billboard** (billboard icon with megaphone) - highlighted when selected
- **Point of Sale** (POS terminal icon)
- **Cinema Screens** (cinema screen icon)
- **Airport** (airport/airplane icon)

**Visual States**:
- Default: Light gray border, black icon
- Selected: Red border, pink/red background fill, red icon
- Clickable with smooth transitions

#### Promotional Banner
- Full-width banner with background image
- Dark overlay for text readability
- **Title**: "Credit Card Offer" (bold, white)
- **Subtitle**: "Your next credit card gets you 24 free tickets!" (white)
- Clickable banner

#### Recommended High Traffic Zone Section
- **Section Title**: "RECOMMENDED HIGH TRAFFIC ZONE" (bold, black)
- **See All Link**: Red text, right-aligned
- **Ad Space Cards** (2-column horizontal scroll):
  - Large image/thumbnail
  - **Title**: Bold, black (e.g., "Digital Screen at BKC")
  - **Location**: Red pin icon + address (e.g., "Bandra Kurla Complex, Mumbai")
  - **Price**: Red text, large (e.g., "₹25,00,000/mo")
  - Clickable cards navigate to detail page

#### Bottom Navigation Bar
Five-tab navigation (always visible):
- **Home** (house icon) - Red when active
- **Search** (magnifying glass icon)
- **AI Planner** (magic wand/sparkle icon)
- **Design** (picture frame icon)
- **Cart** (shopping cart icon)

---

### 2. Ad Space Listing with Categories

#### Listing Display
- Grid or list view of ad spaces
- Filtered by:
  - Selected location (city)
  - Selected category
  - Search query

#### Ad Space Card Components
Each card displays:
- **Image**: High-quality thumbnail
- **Title**: Bold, prominent
- **Location**: 
  - Red pin icon
  - City and area (e.g., "Andheri West, Mumbai")
- **Price**: 
  - Red text
  - Format: "₹X,XX,XXX/mo" or "₹XX,XXX/day"
- **Availability Badge**: 
  - Green with checkmark: "Available"
  - Orange: "Booked"
  - Red: "Unavailable"
- **Category Tag**: Small red pill with category name

#### Category Filtering
- Clicking a category icon filters the listing
- Active category is visually highlighted
- "All" option to show all categories
- Category count badges (optional)

#### Ad Space Detail Page
When user clicks on an ad space card:

**Header**:
- Back navigation
- Breadcrumb: "ad-space/[id]"
- Category tag (e.g., "Billboard" - red pill)

**Hero Image**:
- Large, full-width image
- High-quality photo of the ad space

**Details Section**:
- **Title**: Large, bold (e.g., "Digital Screen at BKC")
- **Location**: Red pin icon + full address
- **Price Section**:
  - Daily rate: "₹83,333/day" (large, blue text)
  - Monthly rate: "₹25,00,000/mo"
- **Availability Tag**: Green badge with checkmark: "Available"

**Description**:
- Detailed description of the ad space
- Features and benefits

**Audience & Reach Metrics** (3 columns):
1. **Daily Impressions**: Eye icon (red), "5K+" or "2K+"
2. **Monthly Footfall**: Group icon (red), "150K+" or "80K+"
3. **Target Audience**: Target icon (red), "Corporate Professionals" or "Shoppers"

**Pricing Table**:
- Light pink background box
- Per Day: ₹83,333
- Per Month: ₹25,00,000

**Location on Map**:
- Embedded map view
- Street-level detail
- Landmarks visible
- Red pin marking exact location
- Address card below map

**Call-to-Action**:
- **"Book Now →" Button**: Red, full-width, white text, right arrow

---

### 3. Search Screen with Map Integration

#### Search Bar
- **Placeholder**: "Search by title, location, category..."
- **Search Icon**: Magnifying glass on left
- **Real-time Search**: Results update as user types
- **Clear Button**: X icon appears when text is entered

#### Location & Filter Controls
- **Location Display**: 
  - Red pin icon
  - Current city (e.g., "Mumbai")
  - Dropdown arrow
- **All Filters Button**: 
  - Pink/red button
  - Opens comprehensive filter panel

#### View Toggle
- **Results Count**: "X results" display
- **View Mode Toggle**:
  - List view icon
  - Map view icon
  - Active view highlighted
- **Hide/Show Map**: Toggle button

#### Map View (Primary Feature)
**Map Integration**:
- Interactive map (Google Maps/Mapbox)
- Full-screen or split view option
- Zoom and pan controls
- Current location button
- Map type toggle (satellite/street)

**Billboard Markers on Map**:
- **Red Location Pins**: Mark ad space locations
- **Price Labels**: Display on pins (e.g., "₹800k", "₹1200k", "₹5000k")
- **Clickable Pins**: Show details on click
- **Highlighted State**: 
  - Selected billboard pin is larger
  - Different color (blue or highlighted red)
  - Pop-up card appears
  - Pin animation on selection

**Pop-up Card on Pin Click**:
- White card with shadow
- **Title**: (e.g., "Cinema Hall Advertising")
- **Price**: (e.g., "₹800,000/month")
- **Quick Info**: Location, category
- **View Details Button**: Navigate to full detail page
- **Close Button**: X icon
- **Add to Cart Button**: Quick add option

**Map Features**:
- Clustering: Group nearby pins when zoomed out
- Info Windows: Detailed pop-ups on marker click
- Custom marker icons per category
- Heat map overlay (optional)
- Traffic layer (optional)
- Street view integration (optional)

#### List View Alternative
- When map is hidden, show list of results
- Same ad space cards as home/listing page
- Scrollable list
- Click to view details
- Infinite scroll or pagination

#### Filter Panel (When "All Filters" Clicked)
**Left Sidebar - Filter Categories**:
- Quick Filters (lightning icon)
- Pricing (price tag icon)
- Location (pin icon)
- Display (monitor icon)
- Publishers (building icon)
- Audience (people icon, Pro badge)

**Right Panel - Filter Options**:

**Pricing Filters**:
- **Price Range**:
  - Min Price input (₹ symbol, default: 0)
  - Max Price input (₹ symbol, default: 100,000)
  - "to" separator
- **Average Daily Footfall**:
  - Min Footfall input (default: 0)
  - Max Footfall input (default: 1,000,000)
  - Description: "Filter adboards by average daily visitor count."
- **Sort Options** (Radio buttons):
  - No sorting (default selected)
  - Price: Low to High
  - Price: High to Low
  - Footfall: Low to High
  - Footfall: High to Low

**Location Filters**:
- **Location Categories** (Checkboxes):
  - **Roadside & Public Spaces**:
    - Roadside Billboards
    - Skywalks
    - Foot Over Bridges
    - Metro Pillars
    - Public Parks
    - Street Furniture
  - **Transit & Travel**:
    - Metro Stations
    - Railway Stations
    - Bus Stops
    - Auto Rickshaws
    - Taxi/Cab Branding
    - Airports
  - **Enclosed Malls & Retail**:
    - Shopping Malls
    - Retail Stores
    - Supermarkets
    - Department Stores
    - Food Courts
    - Retail Corridors
    - Store Entrances
  - **Corporate & Office Campuses**:
    - IT Parks
    - Office Buildings
    - Business Parks
    - Co-working Spaces
    - Corporate Cafeterias
    - Office Lobbies
  - **Lifestyle, Hospitality & Venues**:
    - Hotels
    - Restaurants

**Display Type Filters** (Checkboxes):
- Static Billboard
- Digital Screen
- LED Display
- Backlit Panel
- Vinyl Banner
- Transit Branding

**Filter Actions**:
- "Clear All" button (white, left)
- "Apply Filters" button (red, right)
- Close button (X, top right)

---

### 4. AI Planner - Campaign Creation with Curated Recommendations

#### Overview
Multi-step wizard that collects customer campaign information and generates a curated list of recommended ad spaces based on the customer's idea and requirements.

#### Step 1: Campaign Goal Selection
- **Progress Bar**: Shows "Step 1 of 6" with blue progress indicator
- **Header**: "AI Planner" (centered, black bar)
- **Question**: "What's your campaign goal?" (large, bold)
- **Instruction**: "Choose the primary objective for your campaign"
- **Goal Cards** (2x2 grid):
  1. **Brand Awareness**
     - Icon: Megaphone
     - Description: "Increase brand visibility"
  2. **Engagement**
     - Icon: Group of people
     - Description: "Drive audience interaction"
  3. **Conversions**
     - Icon: Shopping cart
     - Description: "Generate sales & leads"
  4. **Traffic**
     - Icon: Right arrow
     - Description: "Drive website/store visits"
- **Selection State**: Blue border, blue background, blue text
- **Continue Button**: Blue, full-width, right arrow icon

#### Step 2: Product/Service Description
- **Progress Bar**: "Step 2 of 6"
- **Question**: "Tell us about your product or service" (large, bold)
- **Instruction**: "Describe what you're promoting in detail"
- **Large Text Area**:
  - Multi-line input
  - Placeholder: "E.g., We're launching a new eco-friendly water bottle that keeps drinks cold for 24 hours. It's made from recycled materials and comes in 5 vibrant colors..."
  - Character counter (optional)
  - Auto-resize
- **Navigation**:
  - Back button (white, blue border, left arrow)
  - Continue button (blue, right arrow)

#### Step 3: Target Audience
- **Progress Bar**: "Step 3 of 6"
- **Question**: "Who is your target audience?"
- **Input Options**:
  - Demographics (age range, gender, income level)
  - Interests/behaviors (checkboxes or tags)
  - Geographic preferences (city selection)
  - Custom audience description (text area)
- **Navigation**: Back and Continue buttons

#### Step 4: Budget Selection
- **Progress Bar**: "Step 4 of 6"
- **Question**: "What's your budget?"
- **Instruction**: "Enter your total campaign budget in USD"
- **Budget Input**:
  - Large input field
  - Dollar sign ($) in blue
  - Amount display (large, grey)
  - Numeric keyboard on mobile
  - Format: $ 5000
- **Suggested Budgets** (Quick Select Buttons):
  - $1000
  - $2500
  - $5000 (default selected)
  - $10000
- **Navigation**: Back and Continue buttons

#### Step 5: Campaign Duration
- **Progress Bar**: "Step 5 of 6"
- **Question**: "When do you want to run your campaign?"
- **Instruction**: "Tap to select start date"
- **Calendar Widget**:
  - Month/Year header with navigation (< > arrows)
  - Current month display: "November 2025"
  - Day names: Sun Mon Tue Wed Thu Fri Sat
  - Date grid:
    - Previous month dates (light grey, disabled)
    - Current month dates (black, selectable)
    - Next month dates (light grey, disabled)
    - Selected date: Blue highlight (e.g., November 6)
  - Date selection
  - Duration picker (optional end date)
- **Navigation**:
  - Back button
  - "Generate Plan" button (blue, primary action, right arrow)

#### Step 6: Curated Recommendations
- **Progress Bar**: "Step 6 of 6"
- **AI-Generated Plan Display**:
  - Summary of all inputs
  - Campaign overview card
- **Curated Ad Space List**:
  - **Title**: "Recommended Ad Spaces for Your Campaign"
  - **List of Recommended Spaces**:
    - Ad space cards (similar to listing cards)
    - **AI Reasoning**: Why this space is recommended (e.g., "High footfall in target area")
    - **Match Score**: Percentage or stars (e.g., 95% match)
    - **Budget Allocation**: Suggested spend per space (e.g., "$2000")
    - **Expected Results**: 
      - Impressions: "150K"
      - Reach: "50K"
      - Conversions: "500"
    - **Add to Cart** button on each card
    - **Select All** option
- **Budget Breakdown**:
  - Total budget: $5000
  - Allocated per space
  - Remaining budget
  - Visual chart/graph (pie chart or bar chart)
- **Timeline**:
  - Campaign start date
  - Duration
  - Phased approach (if applicable)
  - Visual timeline bar
- **Expected Results Summary**:
  - Total impressions
  - Total reach
  - Estimated conversions
  - ROI projection
- **Actions**:
  - Edit any step (pencil icon on each step)
  - Save as draft
  - Add all to cart
  - Generate new plan (regenerate button)
  - Proceed to booking

#### AI Matching Logic
The system analyzes:
- Campaign goal alignment (brand awareness vs conversions)
- Product/service keywords (extracted from description)
- Target audience match (demographics, interests, location)
- Budget constraints (fits within budget)
- Location preferences (city, area)
- Historical performance data (impressions, conversions)
- Availability (not booked during campaign dates)
- Category relevance (billboard vs digital vs transit)

**Recommendation Algorithm**:
1. Parse customer input (goal, description, audience, budget)
2. Extract keywords and intent
3. Match against ad space database
4. Score each match based on:
   - Goal alignment (40%)
   - Audience match (30%)
   - Budget fit (20%)
   - Performance history (10%)
5. Rank and return top matches
6. Allocate budget proportionally
7. Generate expected results based on historical data

---

### 5. Design Section (Coming Soon)

#### Design Tab
- **Status**: "Coming Soon" placeholder
- **Visual Design**:
  - Large icon (picture frame or design tool)
  - **Title**: "Design Studio" (large, bold)
  - **Message**: "Coming Soon! Upload and manage your campaign designs here." (medium, grey)
  - **Subtitle**: "We're working on bringing you an amazing design experience." (small, grey)
- **Optional Visual Elements**:
  - Animated icon or illustration
  - Gradient background
  - Coming soon badge

#### Future Features (Planned):
- Design upload (image files)
- Design library (saved designs)
- Design templates
- Design guidelines
- Image editor integration
- Format validation
- Size recommendations

#### Navigation
- Design tab remains visible in bottom navigation
- Clicking shows "Coming Soon" screen
- No functional features yet
- Tab icon remains visible but inactive

---

### 6. Cart Section - Booking Summary

#### Cart Header
- **Title**: "Cart" or "Booking Summary" (large, bold)
- **Item Count Badge**: Number of items in cart (red circle with white number)
- **Clear Cart Button**: Remove all items (optional, grey text)

#### Selected Ad Spaces List
Each item in cart displays as a card:

**Ad Space Card in Cart**:
- **Thumbnail Image**: Small preview (left side)
- **Title**: Ad space name (e.g., "Digital Screen at BKC") - bold
- **Location**: Red pin icon + address (e.g., "Bandra Kurla Complex, Mumbai")
- **Category Tag**: Small red pill with category name
- **Pricing Details**:
  - Daily rate: ₹83,333/day
  - Monthly rate: ₹25,00,000/mo
  - Display both for reference
- **Duration Selection**:
  - Start date picker (calendar icon)
  - End date picker (calendar icon)
  - Duration display (e.g., "30 days") - calculated automatically
  - Date validation (end date after start date)
- **Quantity**: Number of units (if applicable, e.g., multiple screens)
- **Subtotal**: Calculated price for this item (bold)
  - Formula: (price_per_day × days) or (price_per_month × months)
- **Remove Button**: X icon or trash icon (red, top right of card)
- **Edit Button**: Modify dates/quantity (optional)

#### Booking Summary Section
**Summary Card** (sticky at bottom or separate section):
- **Subtotal**: Sum of all items (₹X,XX,XXX)
- **Taxes/Fees**: Breakdown (if applicable)
  - Service fee: ₹XXX
  - GST: ₹XXX
- **Discount**: 
  - Promo code input field (optional)
  - Apply button
  - Discount amount display
- **Total Amount**: Final price (large, bold, red)
  - Format: "₹X,XX,XXX"
- **Currency**: ₹ (Indian Rupees)

#### Date Range Summary
- **Campaign Start**: Date display (e.g., "Nov 6, 2025")
- **Campaign End**: Date display (e.g., "Dec 6, 2025")
- **Total Duration**: Days calculation (e.g., "30 days")
- **Calendar View**: Visual timeline (optional, mini calendar)

#### Actions
- **Continue Shopping**: 
  - Link or button
  - Return to search/home
  - Grey text or outlined button
- **Proceed to Checkout**: 
  - Red button, full-width
  - "Proceed to Payment →" text
  - White text, right arrow icon
  - Navigate to payment page
  - Disabled if cart is empty

#### Empty Cart State
- **Icon**: Empty shopping cart (large, grey)
- **Message**: "Your cart is empty" (bold, black)
- **Subtitle**: "Start adding ad spaces to your cart" (grey)
- **Browse Button**: 
  - Red button
  - "Browse Ad Spaces" text
  - Navigate to search/home

#### Cart Persistence
- Save cart to user account (if logged in)
- Persist across sessions (localStorage/cookies)
- Sync across devices (if logged in)
- Auto-save on changes
- Restore on page load

#### Cart Features
- Real-time price calculation
- Date conflict detection (if space already booked)
- Availability check before checkout
- Quantity validation
- Minimum duration requirements (if any)

---

## Technical Specifications

### Frontend Technology Stack

#### Recommended Stack
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Redux Toolkit / Zustand
- **Forms**: React Hook Form
- **Maps**: 
  - Google Maps API (react-google-maps/api)
  - OR Mapbox (react-map-gl)
- **Date Picker**: React DatePicker
- **Icons**: React Icons / Heroicons
- **HTTP Client**: Axios
- **Payment**: Razorpay React SDK
- **Calendar**: React Big Calendar / FullCalendar

#### Component Structure
```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── search/
│   │   └── page.tsx       # Search with map
│   ├── ad-space/
│   │   └── [id]/
│   │       └── page.tsx   # Ad space detail
│   ├── ai-planner/
│   │   └── page.tsx       # AI Planner wizard
│   ├── design/
│   │   └── page.tsx        # Coming soon
│   └── cart/
│       └── page.tsx        # Cart/Booking summary
├── components/
│   ├── common/
│   │   ├── LocationPicker.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── AdSpaceCard.tsx
│   │   ├── BottomNav.tsx
│   │   └── Button.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── MapView.tsx
│   │   ├── MapMarker.tsx
│   │   ├── MapPopup.tsx
│   │   └── FilterPanel.tsx
│   ├── ai-planner/
│   │   ├── ProgressBar.tsx
│   │   ├── Step1Goal.tsx
│   │   ├── Step2Product.tsx
│   │   ├── Step3Audience.tsx
│   │   ├── Step4Budget.tsx
│   │   ├── Step5Duration.tsx
│   │   └── Step6Recommendations.tsx
│   └── cart/
│       ├── CartItem.tsx
│       ├── BookingSummary.tsx
│       └── EmptyCart.tsx
├── services/
│   ├── api.ts
│   ├── adSpaces.ts
│   ├── aiPlanner.ts
│   └── cart.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAdSpaces.ts
│   └── useCart.ts
└── store/
    ├── slices/
    │   ├── authSlice.ts
    │   ├── adSpaceSlice.ts
    │   └── cartSlice.ts
    └── store.ts
```

### Backend Technology Stack

#### Recommended Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma / TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Payment**: Razorpay SDK
- **AI/ML**: OpenAI API / Custom ML model
- **Cache**: Redis
- **Validation**: Zod / Joi

#### API Endpoints

**Ad Spaces**:
```
GET    /api/ad-spaces              # List all ad spaces (with filters)
GET    /api/ad-spaces/:id          # Get ad space details
GET    /api/ad-spaces/search       # Search ad spaces
GET    /api/ad-spaces/map          # Get map markers (for map view)
GET    /api/ad-spaces/filter       # Filter ad spaces
POST   /api/ad-spaces              # Create ad space (admin/publisher)
PUT    /api/ad-spaces/:id          # Update ad space
DELETE /api/ad-spaces/:id          # Delete ad space
```

**AI Planner / Campaigns**:
```
POST   /api/campaigns              # Create campaign
POST   /api/campaigns/:id/generate # Generate recommendations
GET    /api/campaigns              # Get user's campaigns
GET    /api/campaigns/:id          # Get campaign details
PUT    /api/campaigns/:id          # Update campaign
DELETE /api/campaigns/:id           # Delete campaign
```

**Cart**:
```
GET    /api/cart                   # Get cart items
POST   /api/cart/add               # Add to cart
PUT    /api/cart/:id                # Update cart item
DELETE /api/cart/:id                # Remove from cart
POST   /api/cart/checkout           # Proceed to checkout
POST   /api/cart/clear              # Clear cart
```

**Locations**:
```
GET    /api/locations/cities        # Get all cities
GET    /api/locations/:id          # Get location details
```

**Categories**:
```
GET    /api/categories              # Get all categories
GET    /api/categories/:id         # Get category details
```

**Authentication**:
```
POST   /api/auth/register           # Register user
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user
```

**Payments**:
```
POST   /api/payments/create         # Create payment
POST   /api/payments/verify         # Verify payment
GET    /api/payments/:id            # Get payment details
```

### Database Schema

#### Core Tables

**ad_spaces**:
```sql
CREATE TABLE ad_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  location_id UUID REFERENCES locations(id),
  publisher_id UUID REFERENCES publishers(id),
  display_type VARCHAR(50) NOT NULL,
  price_per_day DECIMAL(12, 2) NOT NULL,
  price_per_month DECIMAL(12, 2) NOT NULL,
  daily_impressions INTEGER DEFAULT 0,
  monthly_footfall INTEGER DEFAULT 0,
  target_audience VARCHAR(255),
  availability_status VARCHAR(20) DEFAULT 'available',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  images JSONB,
  dimensions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ad_spaces_location ON ad_spaces(location_id);
CREATE INDEX idx_ad_spaces_category ON ad_spaces(category_id);
CREATE INDEX idx_ad_spaces_coordinates ON ad_spaces(latitude, longitude);
CREATE INDEX idx_ad_spaces_price ON ad_spaces(price_per_month);
```

**campaigns** (AI Planner):
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  goal VARCHAR(50) NOT NULL,
  product_description TEXT NOT NULL,
  target_audience JSONB,
  budget DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  ai_generated_plan JSONB,
  recommended_spaces JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**cart_items**:
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ad_space_id UUID REFERENCES ad_spaces(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**locations**:
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**categories**:
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(255),
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**users**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company_name VARCHAR(255),
  user_type VARCHAR(20) DEFAULT 'advertiser',
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Design Specifications

### Color Palette

**Primary Colors**:
- **Red/Pink**: #E91E63 / #F50057 (Primary actions, highlights, selected states)
- **Blue**: #1976D2 / #2196F3 (Secondary actions, selected states in AI Planner, links)
- **Green**: #4CAF50 (Success, availability badges)
- **Grey**: #757575 (Text, borders, disabled states)
- **Black**: #000000 (Headers, primary text)
- **White**: #FFFFFF (Backgrounds, cards)

**Status Colors**:
- **Available**: Green (#4CAF50)
- **Booked**: Orange (#FF9800)
- **Unavailable**: Red (#F44336)
- **Pending**: Yellow (#FFC107)

**Map Colors**:
- **Default Pin**: Red (#F44336)
- **Selected Pin**: Blue (#2196F3)
- **Cluster**: Orange (#FF9800)

### Typography

**Headings**:
- H1: 32px, Bold, Black (#000000)
- H2: 24px, Bold, Black
- H3: 20px, Semi-bold, Black
- H4: 18px, Medium, Black

**Body Text**:
- Large: 16px, Regular, Black
- Medium: 14px, Regular, Black/Grey
- Small: 12px, Regular, Grey (#757575)
- Caption: 10px, Regular, Grey

**Font Family**:
- Primary: System fonts (San Francisco, Roboto, etc.)
- Fallback: Arial, sans-serif

### Spacing
- Base unit: 8px
- Common spacing: 8px, 16px, 24px, 32px, 48px, 64px
- Section spacing: 48px - 64px

### Components

**Buttons**:
- Primary: Red background (#E91E63), white text, 8px radius, 40px height
- Secondary: White background, red border (#E91E63), red text, 8px radius
- Tertiary: Transparent, text only
- Size: Small (32px), Medium (40px), Large (48px)
- Hover: Darker shade, slight scale (1.02)
- Disabled: Grey background, grey text, no interaction

**Cards**:
- White background (#FFFFFF)
- 12px border radius
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- 16px padding
- Hover: Slight elevation (shadow increase)

**Input Fields**:
- Border: 1px solid #E0E0E0
- 8px border radius
- 12px 16px padding
- Focus: Blue border (#2196F3), 2px width
- Error: Red border (#F44336)
- Placeholder: Grey (#9E9E9E)

**Icons**:
- Size: 16px (small), 24px (default), 32px (large)
- Color: Inherit from parent or theme
- Stroke width: 1.5px (outline), 2px (filled)

### Responsive Breakpoints
- **Mobile**: < 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Animation & Transitions
- Button hover: 0.2s ease
- Card hover: 0.3s ease
- Page transitions: 0.3s ease
- Loading spinner: 1s linear infinite
- Map marker animation: 0.3s bounce

---

## User Flows

### Flow 1: Browse and Search
1. User lands on Home page
2. Selects location (Mumbai/Bengaluru) from picker
3. Browses categories (clicks on category icon)
4. Views recommended ad spaces
5. Clicks on ad space card → Detail page
6. OR navigates to Search page
7. Uses search bar to find specific spaces
8. OR uses map to browse visually
9. Clicks on map marker → Pop-up appears
10. Clicks "View Details" → Detail page
11. Clicks "Book Now" → Added to cart

### Flow 2: AI Planner
1. User clicks "AI Planner" tab
2. Goes through 6-step wizard:
   - Step 1: Selects campaign goal (e.g., Traffic)
   - Step 2: Describes product/service in detail
   - Step 3: Defines target audience
   - Step 4: Sets budget ($5000)
   - Step 5: Selects campaign start date (Nov 6, 2025)
3. Clicks "Generate Plan"
4. System processes and generates curated recommendations
5. User reviews recommended ad spaces
6. Reviews budget allocation
7. Reviews expected results
8. Adds selected spaces to cart (individual or "Add All")
9. Proceeds to cart/checkout

### Flow 3: Booking from Cart
1. User adds ad spaces to cart (from search, detail page, or AI Planner)
2. Navigates to Cart tab
3. Reviews selected spaces
4. Adjusts dates/quantities if needed
5. Reviews booking summary (subtotal, taxes, total)
6. Applies promo code (optional)
7. Clicks "Proceed to Payment"
8. Redirects to payment page
9. Completes payment (Razorpay)
10. Receives confirmation
11. Booking confirmed

---

## Implementation Priority

### Phase 1: Core Features (MVP) - Weeks 1-4
1. ✅ Home screen with location picker
2. ✅ Ad space listing with categories
3. ✅ Ad space detail page
4. ✅ Search screen with basic search
5. ✅ Map integration with markers
6. ✅ Billboard highlighting on map
7. ✅ Basic cart functionality
8. ✅ User authentication

### Phase 2: AI Features - Weeks 5-6
1. ✅ AI Planner 6-step wizard UI
2. ✅ Campaign data collection
3. ✅ AI recommendation engine (basic)
4. ✅ Curated list generation
5. ✅ Budget allocation logic
6. ✅ Expected results calculation

### Phase 3: Enhanced Features - Weeks 7-8
1. ✅ Advanced filtering system
2. ✅ Design section (Coming Soon)
3. ✅ Cart enhancements (date selection, calculations)
4. ✅ Booking summary
5. ✅ Payment integration (Razorpay)
6. ✅ Email notifications

### Phase 4: Polish & Optimization - Weeks 9-10
1. ✅ Error handling
2. ✅ Loading states
3. ✅ Responsive design
4. ✅ Performance optimization
5. ✅ Testing
6. ✅ Documentation

---

## Key Features Summary

✅ **Home Screen**: Location picker, category selection, recommended listings, promotional banner
✅ **Listing**: Ad spaces with categories, filtering, cards, detail pages
✅ **Search with Map**: Interactive map, billboard markers, highlighting, pop-ups, list view toggle
✅ **AI Planner**: 6-step wizard, idea input, curated recommendations, budget allocation
✅ **Design**: Coming Soon placeholder
✅ **Cart**: Selected items, booking summary, date selection, checkout preparation

---

## Additional Notes

- All features are documented based on the provided screenshots
- Map integration is a core feature with billboard highlighting and pop-ups
- AI Planner generates curated lists based on customer input (idea, goal, audience, budget)
- Design section is intentionally kept as "Coming Soon"
- Cart serves as booking summary before checkout
- All screens maintain consistent bottom navigation
- Mobile-first design approach
- Indian market focus (₹ currency, Indian cities)

---

**Document Version**: 1.0
**Last Updated**: 2025
**Status**: Complete Project Documentation - Single Document
