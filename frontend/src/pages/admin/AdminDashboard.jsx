/**
 * AdminDashboard.jsx - Enhanced Admin Control Panel Page
 * 
 * This component provides a comprehensive admin dashboard featuring:
 * - Real-time business statistics and KPIs
 * - Recent orders monitoring with status tracking
 * - Low stock alerts and inventory management
 * - Revenue tracking and growth analytics
 * - Quick actions for common admin tasks
 * - Recent customer registrations overview
 * - Responsive design with modern UI components
 * - Data visualization and reporting insights
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Clock,
  BarChart3,
  Plus,
  Eye,
  ArrowUpRight,
  Activity,
  Settings,
  Download,
  Filter,
  Calendar,
  Zap
} from 'lucide-react';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
    avgOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadAdminData();
  }, [selectedPeriod]);

  /**
   * Load comprehensive admin dashboard data
   * Fetches and calculates statistics from multiple data sources
   */
  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [products, orders, users, lowStock] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        productsAPI.getLowStock()
      ]);

      // Calculate advanced statistics
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      const todayOrders = orders.filter(order => 
        new Date(order.order_date).toDateString() === new Date().toDateString()
      ).length;

      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      const avgOrderValue = orders.length > 0 
        ? totalRevenue / orders.filter(order => order.status !== 'cancelled').length 
        : 0;

      // Monthly growth calculation (example - requires historical data for real calculation)
      const monthlyGrowth = 12.5; // Percentage growth example

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        lowStockProducts: lowStock.length,
        totalRevenue,
        pendingOrders,
        todayOrders,
        monthlyGrowth,
        avgOrderValue
      });

      setRecentOrders(orders.slice(0, 8));
      setLowStockProducts(lowStock.slice(0, 6));
      setRecentUsers(users.slice(-5).reverse());

      // Sample sales data for charts (replace with real data calculation)
      setSalesData([
        { name: 'ינואר', sales: 12000, orders: 45 },
        { name: 'פברואר', sales: 15000, orders: 52 },
        { name: 'מרץ', sales: 18000, orders: 61 },
        { name: 'אפריל', sales: 22000, orders: 73 },
        { name: 'מאי', sales: 25000, orders: 82 },
        { name: 'יוני', sales: 28000, orders: 95 }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state component
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-content">
          <div className="admin-dashboard-loading-spinner"></div>
          <p className="admin-dashboard-loading-text">טוען נתוני השגרה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard">
        {/* Admin Hero Section */}
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-hero-content">
            <h1 className="admin-dashboard-hero-title">
              שלום, {user?.full_name}! 
            </h1>
            <p className="admin-dashboard-hero-subtitle">
              פנל ניהול מתקדם - כל הנתונים החשובים במקום אחד
            </p>
            <div className="admin-dashboard-hero-stats">
              <span className="admin-dashboard-hero-stat">
                <Activity className="admin-dashboard-hero-stat-icon" />
                מערכת פעילה
              </span>
            </div>
          </div>
        </div>

        {/* Primary Statistics Cards */}
        <div className="admin-dashboard-stats">
          <div className="admin-dashboard-stats-grid">
            <AdminStatCard
              title="סך ההכנסות"
              value={`₪${stats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-8 w-8" />}
              color="admin-stat-card-icon--green"
              change="+12.5%"
              changeType="positive"
              link="/reports"
            />
            <AdminStatCard
              title="הזמנות היום"
              value={stats.todayOrders}
              icon={<ShoppingCart className="h-8 w-8" />}
              color="admin-stat-card-icon--blue"
              change="+8.2%"
              changeType="positive"
            />
            <AdminStatCard
              title="מוצרים במלאי נמוך"
              value={stats.lowStockProducts}
              icon={<AlertTriangle className="h-8 w-8" />}
              color="admin-stat-card-icon--orange"
              link="/products"
            />
            <AdminStatCard
              title="לקוחות פעילים"
              value={stats.totalUsers}
              icon={<Users className="h-8 w-8" />}
              color="admin-stat-card-icon--purple"
              change="+15.3%"
              changeType="positive"
              link="/users"
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="admin-dashboard-content">
          {/* Secondary Statistics Cards */}
          <div className="admin-dashboard-secondary-stats">
            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">ממוצע הזמנה</h3>
                <TrendingUp className="admin-secondary-stat-icon admin-secondary-stat-icon--green" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--green">
                ₪{stats.avgOrderValue.toFixed(0)}
              </div>
              <p className="admin-secondary-stat-description">ממוצע לכל הזמנה</p>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">הזמנות ממתינות</h3>
                <Clock className="admin-secondary-stat-icon admin-secondary-stat-icon--orange" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--orange">
                {stats.pendingOrders}
              </div>
              <p className="admin-secondary-stat-description">דורשות טיפול</p>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">צמיחה חודשית</h3>
                <BarChart3 className="admin-secondary-stat-icon admin-secondary-stat-icon--blue" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--blue">
                +{stats.monthlyGrowth}%
              </div>
              <p className="admin-secondary-stat-description">לעומת חודש קודם</p>
            </div>
          </div>

          {/* Main Content Grid - Two Columns */}
          <div className="admin-dashboard-main-grid">
            {/* Recent Orders Section */}
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <div className="admin-dashboard-section-header-content">
                  <div className="admin-dashboard-section-header-info">
                    <div className="admin-dashboard-section-icon">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="admin-dashboard-section-title">הזמנות אחרונות</h3>
                      <p className="admin-dashboard-section-subtitle">מעקב אחר הזמנות חדשות</p>
                    </div>
                  </div>
                  <Link to="/orders" className="admin-dashboard-section-link">
                    צפה בהכל
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="admin-dashboard-section-body">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <AdminOrderItem key={order.id} order={order} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <ShoppingCart className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">אין הזמנות אחרונות</h4>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Products Section */}
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <div className="admin-dashboard-section-header-content">
                  <div className="admin-dashboard-section-header-info">
                    <div className="admin-dashboard-section-icon">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="admin-dashboard-section-title">מלאי נמוך</h3>
                      <p className="admin-dashboard-section-subtitle">מוצרים הדורשים התרעות</p>
                    </div>
                  </div>
                  <Link to="/products" className="admin-dashboard-section-link">
                    נהל מלאי
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="admin-dashboard-section-body">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <AdminLowStockItem key={product.id} product={product} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <Package className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">כל המוצרים במלאי תקין</h4>
                    <p className="admin-dashboard-empty-subtitle">מצוין! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="admin-dashboard-quick-actions">
            <div className="admin-dashboard-quick-actions-grid">
              <AdminQuickAction
                title="הוסף מוצר חדש"
                description="הוסף מוצרים חדשים למערכת"
                icon={<Plus className="h-6 w-6" />}
                link="/products"
                color="admin-quick-action-icon--green"
              />
              <AdminQuickAction
                title="צפה בדוחות"
                description="דוחות מכירות ומלאי מתקדמים"
                icon={<BarChart3 className="h-6 w-6" />}
                link="/reports"
                color="admin-quick-action-icon--blue"
              />
              <AdminQuickAction
                title="נהל משתמשים"
                description="הוסף ועדכן פרטי לקוחות"
                icon={<Users className="h-6 w-6" />}
                link="/users"
                color="admin-quick-action-icon--purple"
              />
            </div>
          </div>

          {/* Recent Customers Section */}
          <div className="admin-dashboard-section">
            <div className="admin-dashboard-section-header">
              <div className="admin-dashboard-section-header-content">
                <div className="admin-dashboard-section-header-info">
                  <div className="admin-dashboard-section-icon">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="admin-dashboard-section-title">משתמשים חדשים</h3>
                    <p className="admin-dashboard-section-subtitle">רשימת משתמשים שנרשמו לאחרונה</p>
                  </div>
                </div>
                <Link to="/users" className="admin-dashboard-section-link">
                  צפה בהכל
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="admin-dashboard-section-body">
              <div className="admin-dashboard-secondary-stats">
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <AdminUserCard key={user.id} user={user} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <Users className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">אין לקוחות חדשים</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Admin Statistics Card Component
 * Displays key performance indicators with visual styling
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} color - Color theme class
 * @param {string} change - Change percentage indicator
 * @param {string} changeType - Type of change (positive/negative)
 * @param {string} link - Optional navigation link
 * @param {boolean} urgent - Whether to show urgent styling
 */
const AdminStatCard = ({ title, value, icon, color, change, changeType, link, urgent }) => (
  <div className={`admin-stat-card ${urgent ? 'admin-stat-card--urgent' : ''}`}>
    {urgent && <div className="admin-stat-card-badge">!</div>}
    <div className="admin-stat-card-bg" style={{background: 'currentColor'}}></div>
    <div className="admin-stat-card-content">
      <div className="admin-stat-card-header">
        <div className={`admin-stat-card-icon ${color}`}>
          {icon}
        </div>
        {change && (
          <div className={`admin-stat-card-change admin-stat-card-change--${changeType}`}>
            {change}
          </div>
        )}
      </div>
      <div className="admin-stat-card-body">
        <p className="admin-stat-card-title">{title}</p>
        <p className="admin-stat-card-value">{value}</p>
      </div>
      {link && (
        <Link to={link} className="admin-stat-card-link">
          צפה בפירוט
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  </div>
);

/**
 * Admin Order Item Component
 * Displays individual order information in the recent orders list
 * 
 * @param {Object} order - Order object with details
 */
const AdminOrderItem = ({ order }) => (
  <div className="admin-order-item">
    <div className="admin-order-item-left">
      <div className="admin-order-item-icon">
        <ShoppingCart className="h-5 w-5" />
      </div>
      <div className="admin-order-item-info">
        <h4>#{order.order_number}</h4>
        <p>{order.full_name}</p>
        <p>{new Date(order.order_date).toLocaleDateString('he-IL')}</p>
      </div>
    </div>
    <div className="admin-order-item-right">
      <div className="admin-order-item-details">
        <p className="admin-order-item-amount">₪{parseFloat(order.total_amount).toLocaleString()}</p>
        <span className={`admin-order-item-status admin-order-item-status--${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>
    </div>
  </div>
);

/**
 * Admin Low Stock Item Component
 * Displays products that require inventory attention
 * 
 * @param {Object} product - Product object with stock information
 */
const AdminLowStockItem = ({ product }) => (
  <div className="admin-low-stock-item">
    <div className="admin-low-stock-item-left">
      <div className="admin-low-stock-item-icon">
        <Package className="h-5 w-5" />
      </div>
      <div className="admin-low-stock-item-info">
        <h4>{product.name}</h4>
        <p>{product.category_name}</p>
      </div>
    </div>
    <div className="admin-low-stock-item-right">
      <span className="admin-low-stock-item-stock">
        {product.stock_quantity} יחידות
      </span>
      <p className="admin-low-stock-item-action">דרוש חידוש</p>
    </div>
  </div>
);

/**
 * Admin Quick Action Component
 * Displays actionable link cards for common admin tasks
 * 
 * @param {string} title - Action title
 * @param {string} description - Action description
 * @param {ReactNode} icon - Icon component
 * @param {string} link - Navigation link
 * @param {string} color - Color theme class
 */
const AdminQuickAction = ({ title, description, icon, link, color }) => (
  <Link to={link} className="admin-quick-action">
    <div className="admin-quick-action-content">
      <div className={`admin-quick-action-icon ${color}`}>
        {icon}
      </div>
      <div className="admin-quick-action-text">
        <h4 className="admin-quick-action-title">{title}</h4>
        <p className="admin-quick-action-description">{description}</p>
      </div>
    </div>
  </Link>
);

/**
 * Admin User Card Component
 * Displays recent customer registration information
 * 
 * @param {Object} user - User object with details
 */
const AdminUserCard = ({ user }) => (
  <div className="admin-user-card">
    <div className="admin-user-card-header">
      <div className="admin-user-card-avatar">
        {user.full_name ? user.full_name.charAt(0) : 'U'}
      </div>
      <div className="admin-user-card-info">
        <h4>{user.full_name}</h4>
        <p>{user.email}</p>
      </div>
    </div>
    <div className="admin-user-card-footer">
      <span className="admin-user-card-date-label">נרשם:</span>
      <span className="admin-user-card-date-value">
        {new Date(user.created_at).toLocaleDateString('he-IL')}
      </span>
    </div>
  </div>
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

export default AdminDashboard;