import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Hotel = {
  id: string;
  name: string;
  tagline: string;
  short_desc: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  gallery: string[];
  amenities: string[];
  lat: number;
  lng: number;
  badge: string | null;
  sort_order: number;
};

export type Room = {
  id: string;
  hotel_id: string;
  hotel_name: string;
  name: string;
  capacity: number;
  price: number;
  size: number;
  bed_type: string;
  image: string;
  images: string[];
  amenities: string[];
  description: string;
  is_active: boolean;
  sort_order: number;
};

export type GalleryItem = {
  id: string;
  category: string;
  label: string;
  caption: string;
  url: string;
  sort_order: number;
};

export type SiteSetting = {
  key: string;
  value: string;
};
