// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingCart,
  Home,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  Store,
  Plus,
  X
} from 'lucide-react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- מודל שינוי סיסמה ---
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user && !isAdmin()) {
      loadCartCount();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCartCount = async () => {
    try {
      const response = await cartAPI.getCount();
      setCartCount(response.count);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('הסיסמאות לא תואמות');
      return;
    }
    try {
      // כאן תשלח קריאה ל-API לשינוי סיסמה
      console.log("gggggggggggggggggg", user.id, passwordForm.newPassword, passwordForm.confirmPassword);
      console.log("newPassword type:", typeof passwordForm.newPassword);
      console.log("confirmPassword type:", typeof passwordForm.confirmPassword);
      console.log("user.id:", typeof user.id);

      await usersAPI.changePassword(user.id,
         { currentPassword: passwordForm.currentPassword,
           newPassword: passwordForm.newPassword });
           
      toast.success('הסיסמה שונתה בהצלחה!');
      setModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בשינוי הסיסמה');
    }
  };

  

  const adminMenuItems = [
    { path: '/dashboard', label: 'דאשבורד', icon: <Home className="h-4 w-4" /> },
    { path: '/products', label: 'מוצרים', icon: <Package className="h-4 w-4" /> },
    { path: '/categories', label: 'קטגוריות', icon: <Store className="h-4 w-4" /> },
    { path: '/orders', label: 'הזמנות', icon: <FileText className="h-4 w-4" /> },
    { path: '/users', label: 'משתמשים', icon: <Users className="h-4 w-4" /> },
  ];

  const customerMenuItems = [
    { path: '/dashboard', label: 'דאשבורד', icon: <Home className="h-4 w-4" /> },
    { path: '/shop', label: 'חנות', icon: <Store className="h-4 w-4" /> },
    { path: '/my-orders', label: 'ההזמנות שלי', icon: <FileText className="h-4 w-4" /> },
  ];

  const menuItems = isAdmin() ? adminMenuItems : customerMenuItems;

  return (
    <>
      <nav className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          {/* לוגו */}
          <Link to="/dashboard" className="navbar-logo">
            <div className="navbar-logo-icon">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <span className="navbar-logo-text">מרקט פלוס<Plus className="h-4 w-4" /></span>
          </Link>

          {/* תפריט ראשי */}
          <div className="navbar-menu">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span className="navbar-menu-text">{item.label}</span>
              </Link>
            ))}

            {!isAdmin() && (
              <Link
                to="/my-cart"
                className={`navbar-cart ${location.pathname === '/my-cart' ? 'active' : ''}`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="navbar-menu-text">עגלה</span>
              </Link>
            )}
          </div>

          {/* אזור משתמש */}
          <div className="navbar-user-area">
            <div className="navbar-user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="navbar-user-button"
              >
                <div className="navbar-user-avatar">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user?.full_name}</span>
                  <span className="navbar-user-role">{isAdmin() ? 'מנהל' : 'לקוח'}</span>
                </div>
              </button>

              {showUserMenu && (
                <div className="navbar-user-dropdown">
                  <div className="navbar-user-details">
                    <p className="navbar-user-details-name">{user?.full_name}</p>
                    <p className="navbar-user-details-email">{user?.email}</p>
                    <span className={`navbar-role-badge ${isAdmin() ? 'admin' : 'customer'}`}>
                      {isAdmin() ? 'מנהל מערכת' : 'לקוח'}
                    </span>
                  </div>

                  <div className="navbar-dropdown-divider"></div>

                  

                  {/* כפתור שינוי סיסמה */}
                  <button
                    onClick={() => {
                      setModalOpen(true);
                      setShowUserMenu(false);
                    }}
                    className="navbar-dropdown-item"
                  >
                    <User className="h-4 w-4" />
                    שינוי סיסמה
                  </button>

                  <div className="navbar-dropdown-divider"></div>

                  <button
                    onClick={handleLogout}
                    className="navbar-dropdown-item danger"
                  >
                    <LogOut className="h-4 w-4" />
                    יציאה מהמערכת
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showUserMenu && (
          <div className="navbar-overlay" onClick={() => setShowUserMenu(false)} />
        )}
      </nav>

      {/* מודל שינוי סיסמה */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">שינוי סיסמה</h2>

            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="סיסמה נוכחית"
                className="w-full px-3 py-2 border rounded-lg"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="סיסמה חדשה"
                className="w-full px-3 py-2 border rounded-lg"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="אישור סיסמה חדשה"
                className="w-full px-3 py-2 border rounded-lg"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  onClick={() => setModalOpen(false)}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  שמור
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;


