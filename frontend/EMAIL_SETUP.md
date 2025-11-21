# Email Configuration Guide

## Overview

The quote request feature sends emails to `bureau@elfsod.com` when users request a quote from their cart.

## Configuration Options

### Option 1: Brevo (Free - Recommended) ⭐

Brevo (formerly Sendinblue) offers **300 emails per day for FREE** - perfect for development and small projects!

1. **Sign up** at [brevo.com](https://www.brevo.com) (free account, no credit card required)
2. **Get your API key**:
   - Go to Settings > SMTP & API
   - Click "Generate a new API key"
   - Copy your API key
3. **Add to `.env.local`** (in the `frontend` directory):
   ```env
   BREVO_API_KEY=your_brevo_api_key_here
   EMAIL_SERVICE=brevo
   EMAIL_FROM=noreply@elfsod.com
   ```

**Benefits:**
- ✅ 300 emails/day FREE (9,000/month)
- ✅ Can send to any email address
- ✅ No credit card required
- ✅ Easy API integration
- ✅ Good deliverability

### Option 2: Resend

Resend is a modern email API service that's easy to set up.

1. **Sign up** at [resend.com](https://resend.com)
2. **Get your API key** from the dashboard
3. **Add to `.env.local`** (in the `frontend` directory):
   ```env
   RESEND_API_KEY=re_EW49iZ1V_NXpFHg2YrSj5xPXHsWsEDW8u
   EMAIL_SERVICE=resend
   EMAIL_FROM=onboarding@resend.dev
   ```
   
   **Note**: For production, you should:
   - Use your own verified domain for the `EMAIL_FROM` address
   - Keep your API key secure and never commit it to version control
   - The default `onboarding@resend.dev` is for testing only

### Option 3: SMTP (Custom)

For custom SMTP servers (Gmail, SendGrid, etc.):

1. **Add to `.env.local`**:
   ```env
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=Elfsod <noreply@elfsod.com>
   ```

**Note**: SMTP implementation needs to be added to `frontend/app/api/quote/route.ts` in the `sendWithSMTP` function.

### Option 4: Development Mode (Default)

If no email service is configured, the system will:
- Log the email content to the console
- Return success (for testing purposes)

This allows you to test the quote request flow without setting up email services.

## Email Recipient

By default, all quote requests are sent to: **bureau@elfsod.com**

**Important**: If you're using Resend's testing mode (with `onboarding@resend.dev`), you can only send emails to your verified account email address. To send to other recipients:

1. **Option 1**: Verify a domain in Resend and use it as the `from` address
2. **Option 2**: For testing, add to `.env.local`:
   ```env
   QUOTE_EMAIL_RECIPIENT=garvitj26@gmail.com
   ```

To change the recipient permanently, edit `frontend/app/api/quote/route.ts` or set the `QUOTE_EMAIL_RECIPIENT` environment variable.

## Email Content

The email includes:
- All cart items with details (title, location, dates, pricing)
- Order summary (subtotal, tax, total)
- Promo code (if applied)
- Formatted HTML email with styling

## Testing

1. Add items to cart
2. Click "Request Quote" button
3. Check:
   - **Development**: Console logs for email content
   - **Production**: Email inbox at bureau@elfsod.com

## Troubleshooting

- **Email not sending**: Check that `RESEND_API_KEY` is set correctly
- **Console errors**: Check browser console and server logs
- **Email format issues**: Verify the `formatEmailContent` function in the API route

