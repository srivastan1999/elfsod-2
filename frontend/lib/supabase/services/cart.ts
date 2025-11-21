import { createClient } from '../client';

export interface CartItem {
  id?: string;
  user_id: string;
  ad_space_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  subtotal: number;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  quote_request_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get cart items for a user
 */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error.message || String(error));
      throw error;
    }

    return (data || []) as CartItem[];
  } catch (error) {
    console.error('Error in getCartItems:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Add item to cart
 */
export async function addCartItem(item: CartItem): Promise<CartItem | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error adding cart item:', error.message || String(error));
      throw error;
    }

    return data as CartItem;
  } catch (error) {
    console.error('Error in addCartItem:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Update cart item
 */
export async function updateCartItem(id: string, updates: Partial<CartItem>): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating cart item:', error.message || String(error));
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCartItem:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Delete cart item
 */
export async function deleteCartItem(id: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cart item:', error.message || String(error));
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCartItem:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Mark cart items as pending (after quote request)
 */
export async function markCartItemsAsPending(
  userId: string,
  quoteRequestId: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .update({
        approval_status: 'pending',
        quote_request_id: quoteRequestId
      })
      .eq('user_id', userId)
      .is('approval_status', null);

    if (error) {
      console.error('Error marking cart items as pending:', error.message || String(error));
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in markCartItemsAsPending:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Clear cart for a user
 */
export async function clearCart(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .neq('approval_status', 'pending'); // Don't delete pending items

    if (error) {
      console.error('Error clearing cart:', error.message || String(error));
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in clearCart:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

