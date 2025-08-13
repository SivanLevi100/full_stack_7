// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// יצירת instance של axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// הוספת token אוטומטית לכל בקשה
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// טיפול בתגובות וטעות
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // אם ה-token לא תקף, נקה אותו ונתב להתחברות
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // הצגת הודעת שגיאה
    const errorMessage = error.response?.data?.error || 'שגיאה לא צפויה';
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// שירותי אימות
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// שירותי מוצרים
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

// שירותי קטגוריות
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

// שירותי עגלת קניות
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
    return response.data;
  }
};

// שירותי הזמנות
export const ordersAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params}`);
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
  }
};

// שירותי משתמשים
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  changePassword: async (id, passwords) => {
    const response = await api.put(`/users/${id}/password`, passwords);
    return response.data;
  }
};

export default api;