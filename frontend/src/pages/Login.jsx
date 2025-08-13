// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ShoppingCart, Mail, Lock } from 'lucide-react';
import '../styles/auth.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* לוגו */}
        <div className="auth-logo">
          <ShoppingCart className="h-10 w-10 text-white" />
        </div>

        {/* כותרת */}
        <h1 className="auth-title">ברוכים הבאים</h1>
        <p className="auth-subtitle">התחברו למערכת ניהול הסופרמרקט</p>

        {/* טופס */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* אימייל */}
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">כתובת אימייל</label>
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
              />
            </div>
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>

          {/* סיסמה */}
          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">סיסמה</label>
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
                style={{ paddingLeft: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          {/* כפתור התחברות */}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                מתחבר...
              </>
            ) : (
              'התחבר'
            )}
          </button>
        </form>

        {/* קישור להרשמה */}
        <div className="auth-link">
          עוד אין לכם חשבון? <Link to="/register">הירשמו כאן</Link>
        </div>

        {/* משתמשים לדוגמה */}
        <div className="auth-demo-users">
          <div className="auth-demo-title">משתמשים לדוגמה:</div>
          <div className="auth-demo-info">
            <strong>מנהל:</strong> admin@supermarket.com / password123<br/>
            <strong>לקוח:</strong> customer@example.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;