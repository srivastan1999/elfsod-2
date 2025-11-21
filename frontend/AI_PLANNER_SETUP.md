# 🤖 AI Planner Setup Guide

The AI Planner uses **Groq API (FREE)** to intelligently suggest ad spaces based on campaign requirements. Groq offers a generous free tier with fast inference!

## Features

- **AI-Powered Recommendations**: Uses Groq's Llama 3.1 70B model (FREE) to analyze campaign data
- **100% Free**: No credit card required, generous free tier
- **Fast Inference**: Groq's optimized models provide quick responses
- **Fallback System**: If Groq API is not configured, falls back to rule-based matching
- **Smart Matching**: Considers campaign goal, target audience, budget, and product description

## Setup Instructions

### 1. Get Groq API Key (FREE)

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for a free account (no credit card required)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key (starts with `gsk_`)

**Free Tier Benefits:**
- ✅ 14,400 requests per day (FREE)
- ✅ Fast inference with optimized models
- ✅ No credit card required
- ✅ Perfect for development and small projects

### 2. Add Environment Variable

Add the Groq API key to your environment variables:

**For Local Development:**
Create or update `.env.local` in the `frontend` directory:

```env
GROQ_API_KEY=gsk_your-api-key-here
```

**For Vercel Deployment:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**

### 3. Restart Development Server

After adding the environment variable:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## How It Works

### AI-Powered Mode (When Groq API Key is Set)

1. User fills out campaign details in the AI Planner
2. System fetches all available ad spaces from the database
3. Campaign data + ad spaces are sent to Groq's Llama 3.1 70B model
4. AI analyzes and ranks ad spaces based on:
   - Relevance to target audience
   - Alignment with campaign goal
   - Budget efficiency
   - Location and reach potential
   - Display type effectiveness
5. Returns top 10 recommendations with:
   - Match score (0-100)
   - Reasoning for each recommendation
   - Estimated reach and cost

### Rule-Based Fallback (When Groq API Key is Not Set)

If the Groq API key is not configured, the system automatically falls back to rule-based matching that considers:
- Budget constraints
- Campaign goal alignment
- Category relevance
- Location matching

## API Endpoint

**POST** `/api/ai-planner/suggest`

**Request Body:**
```json
{
  "goal": "brand_awareness" | "engagement" | "conversions" | "traffic",
  "productDescription": "Description of product/service",
  "targetAudience": "Target audience description",
  "budget": 5000,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T00:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "method": "ai-powered" | "rule-based",
  "suggestions": [
    {
      "id": "ad-space-id",
      "title": "Ad Space Title",
      "description": "Description",
      "category": { "name": "Category Name" },
      "location": { "city": "Mumbai", "state": "Maharashtra" },
      "display_type": "Billboard",
      "price_per_day": 1000,
      "price_per_month": 25000,
      "daily_impressions": 5000,
      "matchScore": 85,
      "reasoning": "This ad space is recommended because...",
      "estimatedReach": 150000,
      "estimatedCost": 30000
    }
  ]
}
```

## Cost Considerations

- **Groq API**: **100% FREE** for up to 14,400 requests per day
- No credit card required
- Perfect for development and small to medium projects
- If you exceed the free tier, pricing is very affordable

## Troubleshooting

### "GROQ_API_KEY not configured" Warning

This is normal if you haven't set up the API key. The system will use rule-based matching instead.

### API Errors

If you see Groq API errors:
1. Check that your API key is correct (starts with `gsk_`)
2. Verify your account is active at [console.groq.com](https://console.groq.com)
3. Check the API rate limits (14,400 requests/day free tier)
4. Review server logs for detailed error messages

### No Recommendations

If no recommendations are returned:
1. Check that there are available ad spaces in the database
2. Verify the campaign data is being sent correctly
3. Check browser console and server logs for errors

## Testing

To test the AI planner:

1. Navigate to `/ai-planner`
2. Fill out all campaign details:
   - Select a goal
   - Describe your product (minimum 20 characters)
   - Define target audience (minimum 10 characters)
   - Set budget
   - Select dates
3. Click "Generate Plan"
4. View AI-powered recommendations

## Notes

- The AI planner works without authentication (public access)
- Recommendations are generated in real-time
- Results are cached in the browser session
- The system gracefully falls back to rule-based matching if AI is unavailable
- **100% Free** - No costs for using Groq's free tier!

