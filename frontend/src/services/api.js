// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Service
 * - Configures Axios instance with base URL and timeout.
 * - Automatically attaches authentication token to requests.
 * - Handles global response errors (e.g., 401 Unauthorized).
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Attach token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors (logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 * - Handles login, registration, session, and logout.
 */
export const authAPI = {
  // Login (sends email + password)
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', { email, password: '***' });

      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register new user (ensures email field is sent)
  register: async (userData) => {
    try {
      console.log('📝 Attempting registration with:', userData);

      const registrationData = {
        ...userData,
        email: userData.email || userData.email,
        role: userData.role || 'customer'
      };

      const response = await api.post('/auth/register', registrationData);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get currently authenticated user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout and clear local storage
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

/**
 * Products API
 * - CRUD operations for products and stock management.
 */
export const productsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/products?${params}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
  updateStock: async (id, quantity) => {
    const response = await api.put(`/products/${id}/stock`, { quantity });
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get('/products/reports/low-stock');
    return response.data;
  }
};

/**
 * Categories API
 * - CRUD operations for categories.
 */
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  }
};

/**
 * Cart API
 * - Manage shopping cart items and quantities.
 */
export const cartAPI = {
  getItems: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addItem: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { product_id: productId, quantity });
    return response.data;
  },
  updateQuantity: async (productId, quantity) => {
    const response = await api.put('/cart/update', { product_id: productId, quantity });
    return response.data;
  },
  removeItem: async (productId) => {
    await api.delete(`/cart/remove/${productId}`);
  },
  clear: async () => {
    await api.delete('/cart/clear');
  },
  getCount: async () => {
    const response = await api.get('/cart/count');
    console.log("getCount Cart", response.data);
    return response.data;
  }
};

/**
 * Orders API
 * - CRUD operations and status management for orders.
 */
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get(`/orders`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/orders/my/orders');
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  updateTotal: async (id, totalAmount) => {
    try {
      const response = await api.put(`/orders/${id}/total`, { total_amount: totalAmount });
      return response.data;
    } catch (error) {
      console.error('Error updating order total:', error);
      throw error;
    }
  }
};

/**
 * Order Items API
 * - Manage items belonging to specific orders.
 */
export const orderItemsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orderItems?${params}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orderItems/${id}`);
    return response.data;
  },
  create: async (itemData) => {
    const response = await api.post('/orderItems', itemData);
    return response.data;
  },
  update: async (id, itemData) => {
    const response = await api.put(`/orderItems/${id}`, itemData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/orderItems/${id}`);
    return response.data;
  },
  getByOrder: async (orderId) => {
    const response = await api.get(`/orderItems/order/${orderId}`);
    return response.data;
  }
};

/**
 * Users API
 * - Manage user accounts and credentials.
 */
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/users/${id}`);
  },
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  changePassword: async (id, passwords) => {
    console.log("user.id:apiiiiii", typeof id);
    const response = await api.put(`/users/${id}/password`, passwords);
    return response.data;
  }
};

export default api;
