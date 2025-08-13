import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ShoppingCart, Mail, Lock, User, Phone } from 'lucide-react';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // ניקוי שגיאה של השדה
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = 'שם מלא הוא שדה חובה';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'שם מלא חייב להכיל לפחות 2 תווים';
    }

    if (!formData.email) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין';
    }

    if (!formData.phone) {
      newErrors.phone = 'מספר טלפון הוא שדה חובה';
    } else if (!/^05\d{8}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'מספר טלפון לא תקין (05xxxxxxxx)';
    }

    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'אישור סיסמה הוא שדה חובה';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות לא תואמות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
        username: formData.email,    // או username נפרד
        email: formData.email,
        password: formData.password,
        name: formData.full_name,
        address: formData.phone || ''  // ודא שזה לא undefined
    };
    
    console.log('🚀 Frontend sending:', userData);
    
    setLoading(true);
    try {
        await register(userData);
        navigate('/login');
    } catch (error) {
        console.error('Register error:', error);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* לוגו וכותרת */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            הרשמה למערכת
          </h1>
          <p className="text-gray-600">
            צרו חשבון חדש במערכת ניהול הסופרמרקט
          </p>
        </div>

        {/* טופס הרשמה */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* שם מלא */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                <User className="inline h-4 w-4 ml-2" />
                שם מלא
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`form-input ${errors.full_name ? 'border-red-500' : ''}`}
                placeholder="הכניסו את השם המלא שלכם"
                autoComplete="name"
              />
              {errors.full_name && (
                <p className="form-error">{errors.full_name}</p>
              )}
            </div>

            {/* אימייל */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail className="inline h-4 w-4 ml-2" />
                כתובת אימייל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="הכניסו את כתובת האימייל שלכם"
                autoComplete="email"
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            {/* טלפון */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                <Phone className="inline h-4 w-4 ml-2" />
                מספר טלפון
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="05X-XXXXXXX"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="form-error">{errors.phone}</p>
              )}
            </div>

            {/* סיסמה */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock className="inline h-4 w-4 ml-2" />
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input pl-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="בחרו סיסמה חזקה"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* אישור סיסמה */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock className="inline h-4 w-4 ml-2" />
                אישור סיסמה
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input pl-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="הכניסו שוב את הסיסמה"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* כפתור הרשמה */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  נרשם...
                </>
              ) : (
                'הירשם'
              )}
            </button>
          </form>

          {/* קישור להתחברות */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              כבר יש לכם חשבון?{' '}
              <Link 
                to="/login" 
                className="text-green-600 hover:text-green-500 font-medium"
              >
                התחברו כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;