import { createClient } from '../client';

export interface Publisher {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

/**
 * Fetch all publishers
 */
export async function getPublishers(): Promise<Publisher[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('publishers')
      .select('*')
      .eq('verification_status', 'verified')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching publishers:', error.message || String(error));
      throw error;
    }

    return (data || []) as Publisher[];
  } catch (error) {
    console.error('Error in getPublishers:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Fetch a single publisher by ID
 */
export async function getPublisherById(id: string): Promise<Publisher | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('publishers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching publisher:', error.message || String(error));
      return null;
    }

    return data as Publisher;
  } catch (error) {
    console.error('Error in getPublisherById:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

