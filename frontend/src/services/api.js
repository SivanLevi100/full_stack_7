// src/services/api.js - תיקון לשלוח email במקום email
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// שירותי אימות - מתוקן לשלוח email
export const authAPI = {
  // התחברות - מתוקן לשלוח email (האימייל כ-email)
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', { email, password: '***' });

      const response = await api.post('/auth/login', {
        email,  // ✅ שולח את האימייל כ-email
        password
      });

      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Attempting registration with:', userData);

      // ודא שיש email (השתמש באימייל כ-email אם לא קיים)
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

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data || error.message);
      throw error;
    }
  },

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
    console.log("response update productsAPI ",response);
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
    console.log(response);
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
  /*+getAll: async (filters = {}) => {
    params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params}`);
    return response.data;
  },*/
  getAll: async () => {
    const response = await api.get(`/orders`);
    console.log("response.data", response.data)
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    console.log("from ordersAPI");
    console.log(orderData);
    console.log(response);
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


// שירותי פריטי הזמנות
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