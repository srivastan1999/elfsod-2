# Elfsod - Advertising Inventory Aggregator Platform

Elfsod is a comprehensive aggregator platform for advertising inventories, connecting advertisers with various advertising mediums including static billboards, digital screens, transit branding, influencer marketing, and more.

## 🚀 Features

### Core Features
- **Location-Based Discovery**: Search and filter ad spaces by city and location
- **Multiple Inventory Types**: Billboards, digital screens, transit branding, influencers, and more
- **Interactive Maps**: Visual map-based browsing with location pins and pricing
- **Advanced Filtering**: Filter by price, footfall, display type, location categories, and more
- **AI-Powered Campaign Planning**: 6-step wizard for intelligent campaign creation
- **Design Management**: Upload and manage campaign designs
- **Booking System**: Seamless booking and payment integration
- **Real-Time Availability**: Live inventory status updates

### Advertising Inventory Types
- Static Billboards
- Digital Screens (College, Mall, Corporate)
- Transit Branding (Auto Rickshaw, Metro, Bus)
- Influencer Marketing
- Out-of-Home Advertising (Skywalks, Foot Over Bridges)
- Mobility Advertising (Rapido Bikes)
- Retail & Mall Advertising
- Corporate & Office Advertising
- Lifestyle & Hospitality Advertising

## 📚 Documentation

- **[Project Documentation](./PROJECT_DOCUMENTATION.md)**: Comprehensive feature documentation
- **[API Specification](./API_SPECIFICATION.md)**: Complete API endpoint documentation
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)**: Step-by-step implementation instructions

## 🛠️ Technology Stack

### Full Stack (Next.js)
- **Framework**: Next.js 16+ (React 19)
- **Language**: TypeScript
- **State Management**: Zustand
- **UI Library**: Tailwind CSS
- **Maps**: Leaflet / React Leaflet
- **Forms**: React Hook Form
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API Routes**: Next.js API Routes (serverless)

## 📋 Project Structure

```
elfsod/
├── frontend/              # Next.js full-stack application
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes (backend logic)
│   │   └── ...          # Pages and routes
│   ├── components/      # React components
│   ├── lib/            # Utilities and services
│   └── ...             # Configuration files
├── supabase/            # Database schema and seeds
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Elfsod
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local in frontend directory
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Set up Supabase database**
   - Create a Supabase project at https://supabase.com
   - Run the schema and seed files from `frontend/supabase/` directory
   - See `frontend/SUPABASE_SETUP_GUIDE.md` for detailed instructions

5. **Start development server**
   ```bash
   cd frontend
   npm run dev
   ```
   
   The app will be available at http://localhost:3000

## 📱 Key Screens

### Home Screen
- Location selection (Mumbai, Bengaluru, etc.)
- Category browsing (Billboard, Bus Station, Cinema, etc.)
- Recommended high-traffic zones
- Promotional banners

### Search Screen
- Advanced filtering system
- Map and list view toggle
- Real-time search
- Filter by price, footfall, location, display type

### Ad Space Detail
- Comprehensive ad space information
- Pricing (daily/monthly)
- Audience & reach metrics
- Location on map
- Booking functionality

### AI Planner
- 6-step campaign creation wizard
- Goal selection (Brand Awareness, Engagement, Conversions, Traffic)
- Product/service description
- Target audience definition
- Budget selection
- Campaign duration
- AI-generated recommendations

### Design Upload
- Image upload from camera or gallery
- Design name and description
- Image editing capabilities
- Design guidelines

## 🔐 Authentication

The platform supports multiple user types:
- **Advertisers**: Browse and book ad spaces
- **Publishers**: List and manage ad spaces
- **Admins**: Platform management

## 💳 Payment Integration

Integrated with Razorpay for secure payment processing:
- Support for Indian Rupees (₹)
- Multiple payment methods
- Payment verification
- Booking confirmation

## 🗺️ Map Integration

- Google Maps / Mapbox integration
- Interactive location pins
- Price display on markers
- Clickable markers with details
- Map-based filtering

## 🤖 AI Features

- Intelligent campaign planning
- Ad space recommendations based on:
  - Campaign goals
  - Target audience
  - Budget constraints
  - Location preferences
- Expected results estimation

## 📊 Features by Phase

### Phase 1: Foundation ✅
- User authentication
- Basic ad space listing
- Home and search pages
- Category browsing

### Phase 2: Core Features ✅
- Advanced filtering
- Map integration
- Booking system
- Payment integration

### Phase 3: Advanced Features ✅
- AI Planner
- Design management
- Campaign tracking
- Analytics dashboard

## 🧪 Testing

```bash
# Run tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build

```bash
cd frontend
npm run build
npm start
```

The Next.js application includes both frontend and backend (API routes) in a single deployment.

### Environment Setup
- Configure production environment variables
- Set up database connections
- Configure CDN for static assets
- Set up monitoring and error tracking

## 📝 API Documentation

See [API_SPECIFICATION.md](./API_SPECIFICATION.md) for complete API documentation including:
- Authentication endpoints
- Ad spaces endpoints
- Booking endpoints
- Design endpoints
- Campaign/AI Planner endpoints
- Payment endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@elfsod.com or open an issue in the repository.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Social features (reviews, ratings)
- [ ] Business intelligence dashboard
- [ ] Integration with Google Ads and Facebook Ads
- [ ] Multi-language support

---

**Built with ❤️ for the advertising industry**

