// // src/pages/Login.js
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { Eye, EyeOff, ShoppingCart, Mail, Lock } from 'lucide-react';


// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/dashboard';

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.email) {
//       newErrors.email = 'אימייל הוא שדה חובה';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'אימייל לא תקין';
//     }
//     if (!formData.password) {
//       newErrors.password = 'סיסמה היא שדה חובה';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       await login(formData.email, formData.password);
//       navigate(from, { replace: true });
//     } catch (error) {
//       console.error('Login error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         {/* לוגו */}
//         <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
//       <ShoppingCart className="h-8 w-8 text-white" />
//     </div>

//         {/* כותרת */}
//         <h1 className="auth-title">מרקט פלוס</h1>
//         <h2 className="auth-welcome">ברוכים הבאים</h2>
//         <p className="auth-subtitle">התחברו למערכת ניהול הסופרמרקט המתקדמת</p>

//         {/* טופס */}
//         <form onSubmit={handleSubmit} className="auth-form">
//           {/* אימייל */}
//           <div className="auth-input-group">
//             <label htmlFor="email" className="auth-label">כתובת אימייל</label>
//             <div className="relative">
//               <Mail className="auth-input-icon h-5 w-5" />
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`auth-input auth-input-with-icon ${errors.email ? 'error' : ''}`}
//                 placeholder="הכניסו את כתובת האימייל"
//               />
//             </div>
//             {errors.email && <div className="auth-error">{errors.email}</div>}
//           </div>

//           {/* סיסמה */}
//           <div className="auth-input-group">
//             <label htmlFor="password" className="auth-label">סיסמה</label>
//             <div className="relative">
//               <Lock className="auth-input-icon h-5 w-5" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`auth-input auth-input-with-icon ${errors.password ? 'error' : ''}`}
//                 placeholder="הכניסו את הסיסמה"
//                 style={{ paddingLeft: '3rem' }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="auth-password-toggle"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//             {errors.password && <div className="auth-error">{errors.password}</div>}
//           </div>

//           {/* כפתור התחברות */}
//           <button type="submit" disabled={loading} className="auth-button">
//             {loading ? (
//               <>
//                 <div className="loading-spinner"></div>
//                 מתחבר...
//               </>
//             ) : (
//               'התחבר'
//             )}
//           </button>
//         </form>

//         {/* קישור להרשמה */}
//         <div className="auth-link">
//           עוד אין לכם חשבון? <Link to="/register">הירשמו כאן</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// src/pages/Login.js - עם דיבוג מורחב לבעיה
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { Eye, EyeOff, ShoppingCart, Mail, Lock } from 'lucide-react';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const { login, user, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/dashboard';

//   console.log('🔐 Login: Component state:', {
//     formData: { email: formData.email, password: '***' },
//     loading,
//     errors,
//     from,
//     currentUser: user,
//     isAuthenticated
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.email) {
//       newErrors.email = 'אימייל הוא שדה חובה';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'אימייל לא תקין';
//     }
//     if (!formData.password) {
//       newErrors.password = 'סיסמה היא שדה חובה';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     console.log('🚀 Login: === FORM SUBMITTED ===');
//     console.log('📊 Login: Initial state:', {
//       email: formData.email,
//       passwordLength: formData.password.length,
//       loading,
//       from
//     });
    
//     if (!validateForm()) {
//       console.log('❌ Login: Validation failed');
//       return;
//     }

//     setLoading(true);
//     console.log('⏳ Login: Loading state set to true');
    
//     try {
//       console.log('📞 Login: About to call login() function...');
//       console.log('📞 Login: login function type:', typeof login);
      
//       const result = await login(formData.email, formData.password);
      
//       console.log('✅ Login: login() function returned successfully!');
//       console.log('📦 Login: Result:', result);
      
//       // בדיקה שהתוצאה תקינה
//       if (!result) {
//         console.error('❌ Login: No result returned from login function');
//         throw new Error('No result returned from login');
//       }
      
//       if (!result.token) {
//         console.error('❌ Login: No token in result');
//         throw new Error('No authentication token received');
//       }
      
//       if (!result.user) {
//         console.error('❌ Login: No user data in result');
//         throw new Error('No user data received');
//       }
      
//       console.log('🎯 Login: About to navigate to:', from);
      
//       // תן זמן לstate להתעדכן לפני הניווט
//       setTimeout(() => {
//         console.log('🔄 Login: Delayed navigation executing...');
//         navigate(from, { replace: true });
//         console.log('✅ Login: Navigation completed');
//       }, 100);
      
//     } catch (error) {
//       console.error('❌ Login: === LOGIN PROCESS FAILED ===');
//       console.error('🔍 Login: Error type:', error.constructor.name);
//       console.error('🔍 Login: Error message:', error.message);
//       console.error('🔍 Login: Error stack:', error.stack);
      
//       if (error.response) {
//         console.error('🌐 Login: HTTP Response Error');
//         console.error('📊 Login: Status:', error.response.status);
//         console.error('📋 Login: Data:', error.response.data);
//         console.error('📋 Login: Headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('📡 Login: Network Error - Request made but no response');
//         console.error('📡 Login: Request:', error.request);
//       } else {
//         console.error('⚙️ Login: Setup Error:', error.message);
//       }
      
//       // הצגת שגיאה למשתמש
//       setErrors({ 
//         general: error.response?.data?.error || error.message || 'שגיאה בהתחברות' 
//       });
      
//     } finally {
//       setLoading(false);
//       console.log('🏁 Login: Loading state set to false');
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         {/* לוגו */}
//         <div className="auth-logo">
//           <ShoppingCart className="h-10 w-10 text-white" />
//         </div>

//         {/* כותרת */}
//         <h1 className="auth-title">ברוכים הבאים</h1>
//         <p className="auth-subtitle">התחברו למערכת ניהול הסופרמרקט</p>

//         {/* הצגת שגיאה כללית */}
//         {errors.general && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-700 text-sm font-medium">{errors.general}</p>
//           </div>
//         )}

//         {/* טופס */}
//         <form onSubmit={handleSubmit} className="auth-form">
//           {/* אימייל */}
//           <div className="auth-input-group">
//             <label htmlFor="email" className="auth-label">כתובת אימייל</label>
//             <div className="relative">
//               <Mail className="auth-input-icon h-5 w-5" />
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`auth-input auth-input-with-icon ${errors.email ? 'error' : ''}`}
//                 placeholder="הכניסו את כתובת האימייל"
//                 disabled={loading}
//               />
//             </div>
//             {errors.email && <div className="auth-error">{errors.email}</div>}
//           </div>

//           {/* סיסמה */}
//           <div className="auth-input-group">
//             <label htmlFor="password" className="auth-label">סיסמה</label>
//             <div className="relative">
//               <Lock className="auth-input-icon h-5 w-5" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`auth-input auth-input-with-icon ${errors.password ? 'error' : ''}`}
//                 placeholder="הכניסו את הסיסמה"
//                 style={{ paddingLeft: '3rem' }}
//                 disabled={loading}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="auth-password-toggle"
//                 disabled={loading}
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//             {errors.password && <div className="auth-error">{errors.password}</div>}
//           </div>

//           {/* כפתור התחברות */}
//           <button 
//             type="submit" 
//             disabled={loading} 
//             className="auth-button"
//           >
//             {loading ? (
//               <>
//                 <div className="loading-spinner"></div>
//                 מתחבר...
//               </>
//             ) : (
//               'התחבר'
//             )}
//           </button>
//         </form>

//         {/* מידע דיבוג */}
//         <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
//           <p><strong>מצב נוכחי:</strong></p>
//           <p>טוען: {loading ? 'כן' : 'לא'}</p>
//           <p>אימייל: {formData.email || 'ריק'}</p>
//           <p>סיסמה: {formData.password ? `${formData.password.length} תווים` : 'ריק'}</p>
//           <p>יעד ניווט: {from}</p>
//           <p>משתמש נוכחי: {user ? `${user.email} (${user.role})` : 'אין'}</p>
//           <p>מאומת: {isAuthenticated ? 'כן' : 'לא'}</p>
//         </div>

//         {/* קישור להרשמה */}
//         <div className="auth-link">
//           עוד אין לכם חשבון? <Link to="/register">הירשמו כאן</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ShoppingCart, Mail, Lock, ShoppingBag, Plus } from 'lucide-react';
import bgImage from '../assets/images/fff.png';

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
      setErrors({ 
        general: error.response?.data?.error || error.message || 'שגיאה בהתחברות' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" >
      <div className="auth-card">
        {/* לוגו פשוט ומקצועי */}
        <div className="auth-logo">
          <ShoppingCart className="h-16 w-16 text-white" />
        </div>

        {/* כותרות */}
        <h1 className="auth-title">
          מרקט פלוס
          <Plus className="h-1 w-1   text-blue-600  " />
        </h1>
    
        <h2 className="auth-welcome">ברוכים הבאים</h2>
        <p className="auth-subtitle">התחברו למערכת ניהול הסופרמרקט המתקדמת</p>

        {/* הודעת שגיאה כללית */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* טופס */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* אימייל */}
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

          {/* סיסמה */}
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

          {/* כפתור התחברות */}
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

        {/* קישור להרשמה */}
        <div className="auth-link">
          עוד אין לכם חשבון במרקט פלוס? <Link to="/register">הירשמו כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;