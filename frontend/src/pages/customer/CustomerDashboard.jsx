/**
 * CustomerDashboard.jsx - Customer Control Panel Page
 * 
 * This component provides a comprehensive dashboard for customers to:
 * - View account statistics and order history
 * - Access quick actions for shopping and cart management
 * - Monitor pending orders and account status
 * - Navigate to key sections of the application
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Clock,
  Star,
  ArrowUpRight,
  CreditCard,
  User,
  AlertCircle,
  ChevronRight,
  Zap,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { ordersAPI, productsAPI, cartAPI } from '../../services/api';

/**
 * Main Customer Dashboard Component
 * Displays personalized dashboard with user statistics, recent orders, and quick actions
 */
const CustomerDashboard = () => {
  const { user } = useAuth();

  // Customer statistics state
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    favoriteCategory: '',
    cartItems: 0,
    loyaltyPoints: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  /**
   * Loads and calculates customer data from various APIs
   * Fetches orders, products, and cart data to compile dashboard statistics
   */
  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const [orders, products, cartData] = await Promise.all([
        ordersAPI.getMyOrders(),
        productsAPI.getAll(),
        cartAPI.getItems().catch(() => ({ items: [], total: 0 }))
      ]);

      // Calculate customer statistics
      const totalSpent = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      const pendingOrders = orders.filter(order =>
        order.status === 'pending' || order.status === 'confirmed'
      ).length;

      // Calculate loyalty points (1 point per shekel spent)
      const loyaltyPoints = Math.floor(totalSpent);

      setCustomerStats({
        totalOrders: orders.length,
        pendingOrders,
        totalSpent,
        favoriteCategory: 'מוצרי מזון', // Can be calculated dynamically
        cartItems: cartData.items?.length || 0,
        loyaltyPoints
      });

      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state component
  if (loading) {
    return (
      <div className="customer-dashboard-loading">
        <div className="customer-dashboard-loading-content">
          <div className="customer-dashboard-loading-spinner"></div>
          <p className="customer-dashboard-loading-text">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container" >
      <div className="customer-dashboard">
        {/* Hero Header Section */}
        <div className="customer-dashboard-hero">
          <div className="customer-dashboard-hero-bg-element customer-dashboard-hero-bg-element--top"></div>
          <div className="customer-dashboard-hero-bg-element customer-dashboard-hero-bg-element--bottom"></div>

          <div className="customer-dashboard-hero-content">
            <div className="customer-dashboard-hero-main">
              <div className="customer-dashboard-hero-text">
                <div className="customer-dashboard-hero-user-info">
                  <div>
                    <h1 className="customer-dashboard-hero-title">
                      שלום {user?.full_name}!
                    </h1>
                    <p className="customer-dashboard-hero-subtitle">
                      ברוכים הבאים למרקט פלוס - מה תרכשו היום?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div className="customer-dashboard-stats">
          <div className="customer-dashboard-stats-grid">
            <CustomerStatCard
              title="הזמנות שלי"
              value={customerStats.totalOrders}
              icon={<ShoppingCart className="h-7 w-7" />}
              iconColor="blue"
              link="/my-orders"
              trend="+3 השבוע"
            />
            <CustomerStatCard
              title="הזמנות פעילות"
              value={customerStats.pendingOrders}
              icon={<Clock className="h-7 w-7" />}
              iconColor="orange"
              urgent={customerStats.pendingOrders > 0}
              pulse={customerStats.pendingOrders > 0}
            />
            <CustomerStatCard
              title="סך כל הקניות עם סטטוס 'נשלח'"
              value={`₪${customerStats.totalSpent.toLocaleString()}`}
              icon={<CreditCard className="h-7 w-7" />}
              iconColor="green"
            />
            <CustomerStatCard
              title="מוצרים בעגלה"
              value={customerStats.cartItems}
              icon={<Package className="h-7 w-7" />}
              iconColor="purple"
              link="/my-cart"
              urgent={customerStats.cartItems > 0}
              badge={null}
            />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="customer-dashboard-content">
          <div className="customer-dashboard-main-grid">
            {/* Recent Orders Section */}
            <div className="customer-dashboard-orders">
              <div className="customer-dashboard-orders-header">
                <div className="customer-dashboard-orders-header-content">
                  <div className="customer-dashboard-orders-header-info">
                    <div className="customer-dashboard-orders-icon">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="customer-dashboard-orders-title">ההזמנות האחרונות שלי</h3>
                      <p className="customer-dashboard-orders-subtitle">עקוב אחר הסטטוס והתקדמות</p>
                    </div>
                  </div>
                  <Link to="/my-orders" className="customer-dashboard-orders-link">
                    צפה בהכל
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="customer-dashboard-orders-body">
                {recentOrders.length > 0 ? (
                  <div className="customer-dashboard-orders-list">
                    {recentOrders.map(order => (
                      <CustomerOrderItem key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="customer-dashboard-empty">
                    <ShoppingCart className="customer-dashboard-empty-icon" />
                    <h4 className="customer-dashboard-empty-title">עוד לא ביצעת הזמנות</h4>
                    <p className="customer-dashboard-empty-description">
                      התחל לקנות ותוכל לעקוב אחר ההזמנות שלך כאן
                    </p>
                    <Link to="/shop" className="customer-dashboard-empty-button">
                      התחל לקנות
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="customer-dashboard-quick-actions">
            <div className="customer-dashboard-quick-actions-grid">
              <CustomerQuickAction
                title="התחל לקנות"
                description="עיין במגוון המוצרים"
                icon={<ShoppingCart className="h-6 w-6" />}
                link="/shop"
                iconColor="blue"
              />
              <CustomerQuickAction
                title="עגלת הקניות"
                description={`${customerStats.cartItems} מוצרים בעגלה`}
                icon={<Package className="h-6 w-6" />}
                link="/my-cart"
                iconColor="green"
                badge={null}
              />
              {/* Commented out profile section
              <CustomerQuickAction
                title="הפרופיל שלי"
                description="עדכן פרטים אישיים"
                icon={<User className="h-6 w-6" />}
                link="/profile"
                iconColor="purple"
              /> */}
            </div>
          </div>

          {/* Daily Tips Section */}
          <div className="customer-dashboard-tips">
            <div className="customer-dashboard-tips-content">
              <div className="customer-dashboard-tips-icon">
                <Star className="h-6 w-6" />
              </div>
              <div className="customer-dashboard-tips-text">
                <div className="customer-dashboard-tips-header">
                  <h3 className="customer-dashboard-tips-title">טיפ היום</h3>
                  <span className="customer-dashboard-tips-badge">חדש</span>
                </div>
                <p className="customer-dashboard-tips-description">
                  ידעת שחיסכון בנרגיה במקרר יכול להתחיל מסידור נכון של המוצרים? שמור את הירקות בתנאי טריות ואת המוצרים הקפואים יחד.
                </p>
                <div className="customer-dashboard-tips-footer">
                  <div className="customer-dashboard-tips-footer-item">
                    <Calendar className="h-4 w-4" />
                    עדכון יומי
                  </div>
                  <div className="customer-dashboard-tips-footer-item">
                    <CheckCircle className="h-4 w-4" />
                    טיפים מועילים
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Customer Statistics Card Component
 * Displays individual stat with icon, value, and optional actions
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} iconColor - Color theme for icon
 * @param {string} link - Optional navigation link
 * @param {string} trend - Optional trend indicator
 * @param {boolean} urgent - Whether to show urgent styling
 * @param {boolean} pulse - Whether to show pulsing animation
 * @param {string} badge - Optional badge text
 */
const CustomerStatCard = ({ title, value, icon, iconColor, link, trend, urgent, pulse, badge }) => (
  <div className={`customer-stat-card ${urgent ? 'customer-stat-card--urgent' : ''} ${pulse ? 'customer-stat-card--pulse' : ''}`}>
    <div className={`customer-stat-card-bg bg-gradient-to-br from-${iconColor}-500 to-${iconColor}-600`}></div>

    {badge && (
      <span className="customer-stat-card-badge">{badge}</span>
    )}

    <div className="customer-stat-card-content">
      <div className="customer-stat-card-header">
        <div className={`customer-stat-card-icon customer-stat-card-icon--${iconColor}`}>
          {icon}
        </div>
        {urgent && (
          <AlertCircle className="customer-stat-card-alert h-5 w-5" />
        )}
      </div>

      <div className="customer-stat-card-body">
        <p className="customer-stat-card-title">{title}</p>
        <p className="customer-stat-card-value">{value}</p>

        {trend && (
          <p className="customer-stat-card-trend">{trend}</p>
        )}

        {link && (
          <Link to={link} className="customer-stat-card-link">
            צפה בפירוט
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  </div>
);

/**
 * Customer Order Item Component
 * Displays individual order in the recent orders list
 * 
 * @param {Object} order - Order object with id, order_number, order_date, total_amount, status
 */
const CustomerOrderItem = ({ order }) => (
  <div className="customer-order-item">
    <div className="customer-order-item-left">
      <div className="customer-order-item-icon">
        <ShoppingCart className="h-6 w-6" />
      </div>
      <div className="customer-order-item-info">
        <h4>הזמנה #{order.order_number}</h4>
        <p>{new Date(order.order_date).toLocaleDateString('he-IL')}</p>
      </div>
    </div>

    <div className="customer-order-item-right">
      <div className="customer-order-item-details">
        <p className="customer-order-item-amount">₪{parseFloat(order.total_amount).toLocaleString()}</p>
        <span className={`customer-order-item-status customer-order-item-status--${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>
      <ChevronRight className="customer-order-item-arrow h-5 w-5" />
    </div>
  </div>
);

/**
 * Customer Quick Action Component
 * Displays actionable link cards for common customer tasks
 * 
 * @param {string} title - Action title
 * @param {string} description - Action description
 * @param {ReactNode} icon - Icon component
 * @param {string} link - Navigation link
 * @param {string} iconColor - Icon color theme
 * @param {string} badge - Optional badge text
 */
const CustomerQuickAction = ({ title, description, icon, link, iconColor, badge }) => (
  <Link to={link} className="customer-quick-action">
    {badge && (
      <span className="customer-quick-action-badge">{badge}</span>
    )}

    <div className="customer-quick-action-content">
      <div className={`customer-quick-action-icon customer-quick-action-icon--${iconColor}`}>
        {icon}
      </div>
      <div className="customer-quick-action-text">
        <h4 className="customer-quick-action-title">{title}</h4>
        <p className="customer-quick-action-description">{description}</p>
      </div>
      <ChevronRight className="customer-quick-action-arrow h-5 w-5" />
    </div>
  </Link>
);

/**
 * Helper function to get localized status text
 * Converts English status codes to Hebrew display text
 * 
 * @param {string} status - Order status code
 * @returns {string} Localized status text
 */
const getStatusText = (status) => {
  const statusMap = {
    pending: 'ממתינה',
    confirmed: 'אושרה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה'
  };
  return statusMap[status] || status;
};

export default CustomerDashboard;