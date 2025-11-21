import { createClient } from '../client';

export interface QuoteRequest {
  id?: string;
  quote_request_id: string;
  user_email?: string;
  items: any;
  subtotal: number;
  tax: number;
  total: number;
  promo_code?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new quote request
 */
export async function createQuoteRequest(quote: QuoteRequest): Promise<QuoteRequest | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert(quote)
      .select()
      .single();

    if (error) {
      console.error('Error creating quote request:', error.message || String(error));
      throw error;
    }

    return data as QuoteRequest;
  } catch (error) {
    console.error('Error in createQuoteRequest:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get quote request by ID
 */
export async function getQuoteRequestById(quoteRequestId: string): Promise<QuoteRequest | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('quote_request_id', quoteRequestId)
      .single();

    if (error) {
      console.error('Error fetching quote request:', error.message || String(error));
      return null;
    }

    return data as QuoteRequest;
  } catch (error) {
    console.error('Error in getQuoteRequestById:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Update quote request status
 */
export async function updateQuoteRequestStatus(
  quoteRequestId: string,
  status: 'pending' | 'approved' | 'rejected',
  adminNotes?: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const updateData: any = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('quote_request_id', quoteRequestId);

    if (error) {
      console.error('Error updating quote request:', error.message || String(error));
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateQuoteRequestStatus:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Get all quote requests (for admin)
 */
export async function getAllQuoteRequests(status?: string): Promise<QuoteRequest[]> {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quote requests:', error.message || String(error));
      throw error;
    }

    return (data || []) as QuoteRequest[];
  } catch (error) {
    console.error('Error in getAllQuoteRequests:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

