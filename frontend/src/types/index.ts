// Common TypeScript interfaces for the application

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number | string;
  category: string;
  image_url?: string;
  is_available?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface StudentInfo {
  student_id: string;
  name: string;
  phone: string;
}

export interface AdminInfo {
  id: number;
  username: string;
}

export interface Order {
  order_id: number;
  student_id: string;
  items_list: string | any[];
  pickup_time: string;
  total_price: number | string;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  name?: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number | string;
  quantity: number;
  description?: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

