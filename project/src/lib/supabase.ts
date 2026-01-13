import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables are missing. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client with fallback values to prevent immediate crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export interface Category {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  name_en: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_active: boolean;
  has_offer: boolean;
  offer_price?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'under_review' | 'preparing' | 'on_way' | 'arrived' | 'completed' | 'cancelled' | 'cancellation_pending';
  payment_method: 'cash' | 'instant_transfer';
  total_amount: number;
  cancellation_reason: string;
  cancelled_by: string;
  cancellation_stage: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  order_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}