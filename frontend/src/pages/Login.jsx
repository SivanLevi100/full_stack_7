// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ShoppingCart, Mail, Lock, Plus } from 'lucide-react';
import bgImage from '../assets/images/fff.png';

/**
 * Login Page Component
 * - Handles user login with email and password
 * - Supports basic validation and error messages
 * - Redirects user to dashboard or previous page after successful login
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Handle input change and clear field error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Basic form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.response?.data?.error || error.message || 'שגיאה בהתחברות' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <ShoppingCart className="h-16 w-16 text-white" />
        </div>

        {/* Titles */}
        <h1 className="auth-title">
          מרקט פלוס
          <Plus className="h-1 w-1 text-blue-600" />
        </h1>
        <h2 className="auth-welcome">ברוכים הבאים</h2>
        <p className="auth-subtitle">התחברו למערכת ניהול הסופרמרקט המתקדמת</p>

        {/* General error message */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email input */}
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">
              <Mail className="h-4 w-4" />
              כתובת אימייל
            </label>
            <div className="relative">
              <Mail className="auth-input-icon h-5 w-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`auth-input auth-input-with-icon ${errors.email ? 'error' : ''}`}
                placeholder="הכניסו את כתובת האימייל"
                disabled={loading}
              />
            </div>
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>

          {/* Password input */}
          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">
              <Lock className="h-4 w-4" />
              סיסמה
            </label>
            <div className="relative">
              <Lock className="auth-input-icon h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input auth-input-with-icon ${errors.password ? 'error' : ''}`}
                placeholder="הכניסו את הסיסמה"
                style={{ paddingLeft: '3.5rem' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          {/* Submit button */}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                מתחבר...
              </>
            ) : (
              'התחבר למערכת'
            )}
          </button>
        </form>

        {/* Link to register page */}
        <div className="auth-link">
          עוד אין לכם חשבון במרקט פלוס? <Link to="/register">הירשמו כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
