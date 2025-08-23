/**
 * Authentication Context Provider
 * Manages user authentication state, login, logout, and user data
 * Handles both admin and customer authentication flows
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

/**
 * Custom hook to use authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Provides authentication state and methods to the entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /**
   * Initialize authentication on app load
   * Check if user is already logged in via localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('🔄 User restored from localStorage:', userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear corrupted data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login function
   * Authenticates user and stores session data
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      console.log('🔍 AuthContext: Starting login process');
      
      // Send login request
      const response = await authAPI.login(email, password);
      
      console.log('✅ AuthContext: Login response received:', response);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Show success message based on user role
      if (response.user.role === 'admin') {
        toast.success(`ברוך הבא, מנהל המערכת! 👨‍💼`);
      } else {
        toast.success(`ברוך הבא, ${response.user.full_name}! 🛒`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      // Display appropriate error message
      let errorMessage = 'שגיאה בהתחברות';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'אימייל או סיסמה שגויים';
      } else if (error.response?.status === 404) {
        errorMessage = 'משתמש לא נמצא';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registration function
   * Creates new user account
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      
      console.log('🔍 AuthContext: Starting registration process');
      
      // Add default role if not specified
      const registrationData = {
        ...userData,
        role: userData.role || 'customer'
      };
      
      const response = await authAPI.register(registrationData);
      
      console.log('✅ AuthContext: Registration successful');
      toast.success('החשבון נוצר בהצלחה! אנא התחבר');
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      
      // Display appropriate error message
      let errorMessage = 'שגיאה ברישום';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 409) {
        errorMessage = 'אימייל כבר קיים במערכת';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Clears user session and redirects
   */
  const logout = async () => {
    try {
      console.log('👋 AuthContext: Logging out');
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('התנתקת בהצלחה');
    }
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
   return user?.role === 'admin';
  };

  /**
   * Check if user is customer
   */
  const isCustomer = () => {
    return user?.role === 'customer' || user?.role === 'user' || (!user?.role && user);
  };

  /**
   * Update user data in state and localStorage
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Get user role text in Hebrew
   */
  const getUserRoleText = () => {
    if (!user) return '';
    
    const roleMap = {
      'admin': 'מנהל מערכת',
      'manager': 'מנהל',
      'customer': 'לקוח',
      'user': 'משתמש'
    };
    
    return roleMap[user.role] || 'משתמש';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin,
    isCustomer,
    updateUser,
    getUserRoleText
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};