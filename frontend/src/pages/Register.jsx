/**
 * Register Page Component
 *
 * Provides a registration form for new users to create an account.
 * Includes validation for full name, email, phone, password, and role selection.
 * Handles form state, errors, and redirects after successful registration.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ShoppingCart, Mail, Lock, User, Phone, Plus } from 'lucide-react';

/**
 * Register Component
 *
 * @returns {JSX.Element} Registration form for new users
 */
const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'customer' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form fields before submission
   *
   * @returns {boolean} true if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^05\d{8}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Invalid phone number (05xxxxxxxx)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone || '',
      role: formData.role
    };

    console.log('🚀 Register form submission:', userData);

    setLoading(true);
    try {
      await register(userData);
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
      setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
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
        <h2 className="auth-welcome">הצטרפו אלינו</h2>
        <p className="auth-subtitle">צרו חשבון חדש במערכת ניהול הסופרמרקט המתקדמת</p>

        {/* General error */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full name */}
          <div className="auth-input-group">
            <label htmlFor="full_name" className="auth-label">
              <User className="h-4 w-4" />
              שם מלא
            </label>
            <div className="relative">
              <User className="auth-input-icon h-5 w-5" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`auth-input auth-input-with-icon ${errors.full_name ? 'error' : ''}`}
                placeholder="הכניסו את השם המלא שלכם"
                autoComplete="name"
                disabled={loading}
              />
            </div>
            {errors.full_name && <div className="auth-error">{errors.full_name}</div>}
          </div>

          {/* Email */}
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
                placeholder="הכניסו את כתובת האימייל שלכם"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className="auth-input-group">
            <label htmlFor="phone" className="auth-label">
              <Phone className="h-4 w-4" />
              מספר טלפון
            </label>
            <div className="relative">
              <Phone className="auth-input-icon h-5 w-5" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`auth-input auth-input-with-icon ${errors.phone ? 'error' : ''}`}
                placeholder="05X-XXXXXXX"
                autoComplete="tel"
                disabled={loading}
              />
            </div>
            {errors.phone && <div className="auth-error">{errors.phone}</div>}
          </div>

          {/* Role */}
          <div className="auth-input-group">
            <label htmlFor="role" className="auth-label">
              תפקיד
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`auth-input ${errors.role ? 'error' : ''}`}
              disabled={loading}
            >
              <option value="customer">לקוח</option>
              <option value="admin">מנהל</option>
            </select>
            {errors.role && <div className="auth-error">{errors.role}</div>}
          </div>

          {/* Password */}
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
                placeholder="בחרו סיסמה חזקה ובטוחה"
                autoComplete="new-password"
                disabled={loading}
                style={{ paddingLeft: '3.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          {/* Confirm password */}
          <div className="auth-input-group">
            <label htmlFor="confirmPassword" className="auth-label">
              <Lock className="h-4 w-4" />
              אישור סיסמה
            </label>
            <div className="relative">
              <Lock className="auth-input-icon h-5 w-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input auth-input-with-icon ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="הכניסו שוב את הסיסמה"
                autoComplete="new-password"
                disabled={loading}
                style={{ paddingLeft: '3.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-password-toggle"
                disabled={loading}
                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <div className="auth-error">{errors.confirmPassword}</div>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
            aria-label="Register to the system"
          >
            {loading ? (
              <>
                <div className="loading-spinner" aria-hidden="true"></div>
                נרשם למערכת...
              </>
            ) : (
              <>
                <span>הירשם למרקט פלוס</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Link to login */}
        <div className="auth-link">
          כבר יש לכם חשבון במרקט פלוס?{' '}
          <Link to="/login">התחברו כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
