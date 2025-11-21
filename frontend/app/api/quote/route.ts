import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as brevo from '@getbrevo/brevo';
import { createQuoteRequest } from '@/lib/supabase/services/quoteRequests';

interface CartItem {
  id: string;
  ad_space: {
    id: string;
    title: string;
    price_per_day: number;
    location?: {
      address?: string;
      city?: string;
    };
    images?: string[];
  };
  start_date: string;
  end_date: string;
  quantity: number;
  subtotal: number;
}

interface QuoteRequest {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  promoCode?: string;
  quoteRequestId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();
    const { items, subtotal, tax, total, promoCode, quoteRequestId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Generate quote request ID if not provided
    const requestId = quoteRequestId || `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save to database first
    const quoteRequest = await createQuoteRequest({
      quote_request_id: requestId,
      items: items,
      subtotal,
      tax,
      total,
      promo_code: promoCode,
      status: 'pending',
    });

    if (!quoteRequest) {
      return NextResponse.json(
        { error: 'Failed to save quote request to database' },
        { status: 500 }
      );
    }

    // Format email content
    const emailContent = formatEmailContent(items, subtotal, tax, total, promoCode, requestId);

    // Send email using configured service
    const emailResult = await sendEmail(emailContent);

    if (!emailResult.success) {
      // Even if email fails, quote is saved - log the error but return success
      console.error('Email sending failed but quote saved:', emailResult.error);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Quote request sent successfully',
      quoteRequestId: requestId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error processing quote request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatEmailContent(
  items: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  promoCode?: string,
  quoteRequestId?: string
): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const itemsHtml = items.map((item, index) => {
    const days = Math.ceil(
      (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const itemTotal = item.subtotal;

    return `
      <div class="item">
        <h3>${index + 1}. ${item.ad_space.title}</h3>
        <p><strong>Location:</strong> ${item.ad_space.location?.address || item.ad_space.location?.city || 'N/A'}</p>
        <p><strong>Dates:</strong> ${new Date(item.start_date).toLocaleDateString('en-IN', { dateStyle: 'long' })} - ${new Date(item.end_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        <p><strong>Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
        <p><strong>Price per day:</strong> ${formatPrice(item.ad_space.price_per_day)}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Subtotal:</strong> ${formatPrice(itemTotal)}</p>
      </div>
    `;
  }).join('');

  const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #E91E63, #F50057); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0 0 10px 0; }
    .header p { margin: 0; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .item { background: white; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #E91E63; }
    .item h3 { margin: 0 0 10px 0; color: #E91E63; }
    .item p { margin: 5px 0; }
    .summary { background: white; padding: 20px; margin-top: 20px; border-radius: 5px; }
    .summary h2 { margin-top: 0; }
    .total { font-size: 24px; font-weight: bold; color: #E91E63; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
        <div class="header">
          <h1>New Quote Request</h1>
          <p>Date: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
          ${quoteRequestId ? `<p>Quote ID: ${quoteRequestId}</p>` : ''}
        </div>
    <div class="content">
      <h2>Cart Items (${items.length})</h2>
      ${itemsHtml}
      <div class="summary">
        <h2>Order Summary</h2>
        <table>
          <tr>
            <th>Item</th>
            <th>Amount</th>
          </tr>
          <tr>
            <td>Subtotal</td>
            <td>${formatPrice(subtotal)}</td>
          </tr>
          <tr>
            <td>Tax & Fees (18%)</td>
            <td>${formatPrice(tax)}</td>
          </tr>
          ${promoCode ? `<tr><td>Promo Code: ${promoCode}</td><td>Applied</td></tr>` : ''}
          <tr>
            <td><strong>Total</strong></td>
            <td class="total">${formatPrice(total)}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

  return content;
}

async function sendEmail(content: string): Promise<{ success: boolean; error?: string }> {
  // Check if email service is configured
  const emailService = process.env.EMAIL_SERVICE || 'brevo';
  // Use environment variable for recipient, fallback to bureau@elfsod.com
  const recipientEmail = process.env.QUOTE_EMAIL_RECIPIENT || 'bureau@elfsod.com';

  try {
    if (emailService === 'brevo') {
      const result = await sendWithBrevo(content, recipientEmail);
      return result;
    } else if (emailService === 'resend') {
      const result = await sendWithResend(content, recipientEmail);
      return result;
    } else if (emailService === 'smtp') {
      const result = await sendWithSMTP(content, recipientEmail);
      return result;
    } else {
      // Fallback: Log to console (for development)
      console.log('=== QUOTE REQUEST EMAIL ===');
      console.log('To:', recipientEmail);
      console.log('Content:', content);
      return { success: true }; // Return true for development
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function sendWithResend(content: string, to: string): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, logging email instead');
    console.log('=== QUOTE REQUEST EMAIL ===');
    console.log('To:', to);
    console.log('Subject: New Quote Request - Elfsod');
    console.log('Content length:', content.length, 'characters');
    return { success: true };
  }

  try {
    const resend = new Resend(resendApiKey);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: 'New Quote Request - Elfsod',
      html: content,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return { 
        success: false, 
        error: `Resend API error: ${JSON.stringify(result.error)}` 
      };
    }

    console.log('Email sent successfully. ID:', result.data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return { 
      success: false, 
      error: `Exception: ${errorMessage}` 
    };
  }
}

async function sendWithBrevo(content: string, to: string): Promise<{ success: boolean; error?: string }> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.warn('BREVO_API_KEY not configured, logging email instead');
    console.log('=== QUOTE REQUEST EMAIL ===');
    console.log('To:', to);
    console.log('Subject: New Quote Request - Elfsod');
    console.log('Content length:', content.length, 'characters');
    return { success: true };
  }

  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'New Quote Request - Elfsod';
    sendSmtpEmail.htmlContent = content;
    sendSmtpEmail.sender = { 
      name: 'Elfsod', 
      email: process.env.EMAIL_FROM || 'noreply@elfsod.com' 
    };
    sendSmtpEmail.to = [{ email: to }];

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Brevo API returns { response, body } structure
    const messageId = (result as any)?.messageId || (result as any)?.body?.messageId || 'N/A';
    console.log('Email sent successfully via Brevo. Message ID:', messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email with Brevo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return { 
      success: false, 
      error: `Brevo API error: ${errorMessage}` 
    };
  }
}

async function sendWithSMTP(content: string, to: string): Promise<{ success: boolean; error?: string }> {
  // SMTP implementation would go here
  // For now, we'll use a simple approach
  console.log('SMTP email service not yet implemented');
  console.log('=== QUOTE REQUEST EMAIL ===');
  console.log('To:', to);
  console.log('Content:', content);
  return { success: true };
}

