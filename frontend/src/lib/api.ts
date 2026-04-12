import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { MenuItem, StudentInfo, AdminInfo, Order, ApiResponse } from '../types/index';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  registerStudent: (data: { student_id: string; name: string; phone: string; password: string }) =>
    apiClient.post('/auth/register', data),

  loginStudent: (data: { student_id: string; password: string }) =>
    apiClient.post('/auth/login', data),

  loginAdmin: (data: { username: string; password: string }) =>
    apiClient.post('/auth/admin/login', data),

  createAdmin: (data: { username: string; password: string; email?: string }) =>
    apiClient.post('/auth/admin-create', data)
};

// Menu Endpoints
export const menuApi = {
  getMenu: () =>
    apiClient.get<MenuItem[]>('/menu'),

  addMenuItem: (data: FormData) =>
    apiClient.post('/menu', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateMenuItem: (id: number, data: FormData) =>
    apiClient.put(`/menu/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteMenuItem: (id: number) =>
    apiClient.delete(`/menu/${id}`)
};

// Orders Endpoints
export const ordersApi = {
  submitOrder: (data: { student_id: string; items: any[]; pickup_time: string; total_price: number }) =>
    apiClient.post('/orders', data),

  getPendingOrders: () =>
    apiClient.get<Order[]>('/orders'),

  getStudentOrders: (student_id: string) =>
    apiClient.get<Order[]>(`/orders/${student_id}`),

  getCompletedOrders: () =>
    apiClient.get<Order[]>('/orders/completed'),

  updateOrderStatus: (order_id: number, status: string) =>
    apiClient.post(`/orders/${order_id}/status`, { status })
};

export default apiClient;
