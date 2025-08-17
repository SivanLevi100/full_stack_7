// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  Store,
  Bell,
  Search
} from 'lucide-react';
import { cartAPI } from '../services/api';


const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isAdmin()) {
      loadCartCount();
    }
  }, [user, isAdmin]);

  const loadCartCount = async () => {
    try {
      const response = await cartAPI.getCount();
      console.log("count cart",response.count);/////////////
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const adminMenuItems = [
    { path: '/dashboard', label: 'דאשבורד', icon: <Home className="h-5 w-5" /> },
    { path: '/products', label: 'מוצרים', icon: <Package className="h-5 w-5" /> },
    { path: '/categories', label: 'קטגוריות', icon: <Store className="h-5 w-5" /> },
    { path: '/orders', label: 'הזמנות', icon: <FileText className="h-5 w-5" /> },
    { path: '/users', label: 'משתמשים', icon: <Users className="h-5 w-5" /> },
  ];

  const customerMenuItems = [
    { path: '/dashboard', label: 'דאשבורד', icon: <Home className="h-5 w-5" /> },
    { path: '/shop', label: 'חנות', icon: <Store className="h-5 w-5" /> },
    { path: '/my-cart', label: 'סל קניות שלי',icon: <ShoppingCart className="h-5 w-5" /> },
    { path: '/my-orders', label: 'ההזמנות שלי', icon: <FileText className="h-5 w-5" /> },
  ];

  const menuItems = isAdmin() ? adminMenuItems : customerMenuItems;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* לוגו */}
          <Link to="/dashboard" className="flex items-center gap-3 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <span className="hidden sm:block">סופרמרקט</span>
          </Link>

          {/* תפריט דסקטופ */}
          <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* עגלת קניות ללקוחות */}
            {!isAdmin() && (
              <Link
                //to="/cart"
                to="my-cart"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative ${location.pathname === '/my-cart'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
              >
                <ShoppingCart className="h-5 w-5" />
                עגלה
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* אזור משתמש */}
          <div className="hidden lg:flex items-center gap-4">
            {/* הודעות */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* תפריט משתמש */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{user?.full_name}</span>
              </button>

              {/* תפריט נפתח */}
              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${isAdmin() ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {isAdmin() ? 'מנהל' : 'לקוח'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    הפרופיל שלי
                  </Link>

                  {isAdmin() && (
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      הגדרות
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    יציאה
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* כפתור תפריט נייד */}
          <div className="lg:hidden flex items-center gap-2">
            {/* עגלה נייד */}
            {!isAdmin() && (
              <Link
                //to="/cart"
                to="my-cart"
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* תפריט נייד */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* פרופיל נייד */}
            <div className="border-t border-gray-200 pt-4 mt-4">

              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <User className="h-5 w-5" />
                הפרופיל שלי
              </Link>

              {isAdmin() && (
                <Link
                  to="/settings"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Settings className="h-5 w-5" />
                  הגדרות
                </Link>
              )}

              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
                יציאה
              </button>
            </div>
          </div>
        )}
      </div>

      {/* סגירת תפריט משתמש בלחיצה מחוץ לתיבה */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;