// src/contexts/AuthContext.js - מתוקן סופי
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  // בדיקה אם המשתמש מחובר בעת טעינת האפליקציה
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
          // אם יש שגיאה בפענוח, נקה הכל
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // התחברות
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      console.log('🔐 AuthContext: Starting login process');
      
      // שליחת בקשת התחברות
      const response = await authAPI.login(email, password);
      
      console.log('✅ AuthContext: Login response received:', response);
      
      // שמירת הטוקן והמשתמש
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // הודעת הצלחה מותאמת לסוג המשתמש
      if (response.user.role === 'admin') {
        toast.success(`ברוך הבא, מנהל המערכת! 👨‍💼`);
      } else {
        toast.success(`ברוך הבא, ${response.user.full_name}! 🛒`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      // הצגת הודעת שגיאה מותאמת
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

  // הרשמה
  const register = async (userData) => {
    try {
      setLoading(true);
      
      console.log('📝 AuthContext: Starting registration process');
      
      // הוספת role ברירת מחדל אם לא קיים
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
      
      // הצגת הודעת שגיאה מותאמת
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

  // התנתקות
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

  // בדיקה אם המשתמש הוא מנהל
  const isAdmin = () => {
   return user?.role === 'admin';
  };

  // בדיקה אם המשתמש הוא לקוח
  const isCustomer = () => {
    return user?.role === 'customer' || user?.role === 'user' || (!user?.role && user);
  };

  // עדכון פרטי המשתמש
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // פונקציה לקבלת שם התפקיד בעברית
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


// // src/contexts/AuthContext.js - עם בדיקת state מפורטת
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // בדיקה אם המשתמש מחובר בעת טעינת האפליקציה
//   useEffect(() => {
//     const initAuth = async () => {
//       console.log('🚀 AuthContext: === STARTING INITIALIZATION ===');
      
//       const token = localStorage.getItem('token');
//       const savedUser = localStorage.getItem('user');
      
//       console.log('🔍 AuthContext: localStorage check:', {
//         hasToken: !!token,
//         tokenLength: token?.length,
//         hasSavedUser: !!savedUser,
//         savedUserPreview: savedUser?.substring(0, 50) + '...'
//       });
      
//       if (token && savedUser) {
//         try {
//           const userData = JSON.parse(savedUser);
//           console.log('📦 AuthContext: Parsed user data:', userData);
          
//           setUser(userData);
//           setIsAuthenticated(true);
          
//           console.log('✅ AuthContext: User restored successfully');
//         } catch (error) {
//           console.error('❌ AuthContext: Error parsing saved user data:', error);
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//         }
//       } else {
//         console.log('❌ AuthContext: No saved auth data found');
//       }
      
//       setLoading(false);
//       console.log('🏁 AuthContext: === INITIALIZATION COMPLETED ===');
//     };

//     initAuth();
//   }, []);

//   // דיבוג מתמיד של המצב
//   useEffect(() => {
//     console.log('🔄 AuthContext: State changed:', {
//       user: user ? {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         full_name: user.full_name
//       } : null,
//       isAuthenticated,
//       loading,
//       timestamp: new Date().toLocaleTimeString()
//     });
//   }, [user, isAuthenticated, loading]);

//   // התחברות
//   const login = async (email, password) => {
//     try {
//       console.log('🔐 AuthContext: === STARTING LOGIN ===');
//       console.log('📧 AuthContext: Email:', email);
      
//       setLoading(true);
      
//       // שליחת בקשת התחברות
//       console.log('📡 AuthContext: Calling authAPI.login...');
//       const response = await authAPI.login(email, password);
      
//       console.log('📨 AuthContext: Login response received:', {
//         hasToken: !!response.token,
//         tokenPreview: response.token?.substring(0, 20) + '...',
//         hasUser: !!response.user,
//         userRole: response.user?.role,
//         userEmail: response.user?.email
//       });
      
//       // וידוא שיש token ו-user
//       if (!response.token) {
//         throw new Error('❌ No token received from server');
//       }
      
//       if (!response.user) {
//         throw new Error('❌ No user data received from server');
//       }
      
//       // שמירת הטוקן והמשתמש
//       console.log('💾 AuthContext: Saving to localStorage...');
//       localStorage.setItem('token', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
      
//       // עדכון state
//       console.log('🎯 AuthContext: Updating state...');
//       setUser(response.user);
//       setIsAuthenticated(true);
      
//       // בדיקה שהעדכון עבד
//       console.log('✅ AuthContext: State updated. Current values:', {
//         userSet: !!response.user,
//         authSet: true,
//         userRole: response.user.role
//       });
      
//       // הודעת הצלחה
//       if (response.user.role === 'admin') {
//         console.log('👨‍💼 AuthContext: Admin user logged in');
//         toast.success(`ברוך הבא, מנהל המערכת! 👨‍💼`);
//       } else {
//         console.log('👤 AuthContext: Regular user logged in');
//         toast.success(`ברוך הבא, ${response.user.full_name }! 🛒`);
//       }
      
//       console.log('🏁 AuthContext: === LOGIN COMPLETED SUCCESSFULLY ===');
//       return response;
      
//     } catch (error) {
//       console.error('❌ AuthContext: === LOGIN FAILED ===');
//       console.error('🔍 Error details:', {
//         name: error.name,
//         message: error.message,
//         responseStatus: error.response?.status,
//         responseData: error.response?.data
//       });
      
//       // הצגת הודעת שגיאה
//       let errorMessage = 'שגיאה בהתחברות';
      
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (error.response?.status === 401) {
//         errorMessage = 'אימייל או סיסמה שגויים';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'משתמש לא נמצא';
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//       console.log('🔄 AuthContext: Loading set to false');
//     }
//   };

//   // הרשמה
//   const register = async (userData) => {
//     try {
//       setLoading(true);
//       console.log('📝 AuthContext: Starting registration');
      
//       const registrationData = {
//         ...userData,
//         role: userData.role || 'customer'
//       };
      
//       const response = await authAPI.register(registrationData);
//       console.log('✅ AuthContext: Registration successful');
//       toast.success('החשבון נוצר בהצלחה! אנא התחבר');
//       return response;
//     } catch (error) {
//       console.error('❌ AuthContext: Registration failed:', error);
      
//       let errorMessage = 'שגיאה ברישום';
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (error.response?.status === 409) {
//         errorMessage = 'אימייל כבר קיים במערכת';
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // התנתקות
//   const logout = async () => {
//     try {
//       console.log('👋 AuthContext: Starting logout');
//       await authAPI.logout();
//     } catch (error) {
//       console.error('⚠️ AuthContext: Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       setUser(null);
//       setIsAuthenticated(false);
//       console.log('✅ AuthContext: Logout completed, state cleared');
//       toast.success('התנתקת בהצלחה');
//     }
//   };

//   // בדיקה אם המשתמש הוא מנהל
//   const isAdmin = () => {
//     const result = user?.role === 'admin';
//     console.log('🔍 AuthContext: isAdmin() called:', {
//       hasUser: !!user,
//       userRole: user?.role,
//       result: result,
//       caller: new Error().stack?.split('\n')[2]?.trim()
//     });
//     return result;
//   };

//   // בדיקה אם המשתמש הוא לקוח
//   const isCustomer = () => {
//     const result = user?.role === 'customer' || user?.role === 'user' || (!user?.role && user);
//     console.log('🔍 AuthContext: isCustomer() called:', {
//       hasUser: !!user,
//       userRole: user?.role,
//       result: result
//     });
//     return result;
//   };

//   // עדכון פרטי המשתמש
//   const updateUser = (updatedUser) => {
//     console.log('🔄 AuthContext: updateUser called:', updatedUser);
//     setUser(updatedUser);
//     localStorage.setItem('user', JSON.stringify(updatedUser));
//   };

//   const getUserRoleText = () => {
//     if (!user) return '';
//     const roleMap = {
//       'admin': 'מנהל מערכת',
//       'manager': 'מנהל',
//       'customer': 'לקוח',
//       'user': 'משתמש'
//     };
//     return roleMap[user.role] || 'משתמש';
//   };

//   const value = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     register,
//     logout,
//     isAdmin,
//     isCustomer,
//     updateUser,
//     getUserRoleText
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };